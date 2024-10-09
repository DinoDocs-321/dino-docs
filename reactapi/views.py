# Standard library imports
import copy
import json
import logging
import os
import random
import re
import string
import time
from datetime import datetime, timedelta, timezone
from urllib import request

# Third-party imports
import bson
import concurrent.futures
from dotenv import load_dotenv
from openai import OpenAI
from pymongo import MongoClient

# Django imports
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.mail import send_mail
from django.db import connections
from django.http import HttpResponseBadRequest, JsonResponse
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# Django REST framework imports
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

# Local application imports
from .email_service import send_verification_email
from .mongodb_utils import get_collection
from .serializers import UserSerializer
from reactapi.models import JSONData

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get the user model
User = get_user_model()

# -------------------------------
# ----- Login/Signup Views ------
class RegisterUser(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'token': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginUser(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            user = authenticate(username=user.username, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user_id': user.id
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------
# ----- Password Reset Views ----
# Setup MongoDB client for reset codes
client_mongo = MongoClient(settings.DATABASES['default']['CLIENT']['host'])
db = client_mongo[settings.DATABASES['default']['NAME']]
reset_codes_collection = db['password_reset_codes']

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)

        code = ''.join(random.choices(string.digits, k=6))

        try:
            reset_codes_collection.insert_one({
                'user_id': str(user.id),
                'email': email,
                'code': code,
                'created_at': datetime.now(timezone.utc),
                'expires_at': datetime.now(timezone.utc) + timedelta(minutes=15)
            })
        except Exception as e:
            logger.error(f"Error saving reset code: {str(e)}")
            return Response({'error': f'Error saving reset code: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if send_verification_email(to_email=email, verification_code=code):
            return Response({'message': 'Reset code sent to email'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyCodeView(APIView):
    def post(self, request):
        code = request.data.get('code')

        logger.info(f"Received verification code: {code}")

        if not code:
            return Response({'error': 'Verification code is required'}, status=status.HTTP_400_BAD_REQUEST)

        reset_code = reset_codes_collection.find_one({
            'code': code,
            'expires_at': {'$gt': datetime.now(timezone.utc)}
        })

        if reset_code:
            return Response({
                'message': 'Code verified successfully',
                'email': reset_code['email']
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')

        if not email or not new_password:
            return Response({'error': 'Invalid request. Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# -------------------------------
# ----- JSON/BSON Views ------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_user_schema(request):
    collection = get_collection()

    schema_name = request.data.get('schema_name')
    json_data = request.data.get('json_data')

    if not schema_name or not json_data:
        return Response({'error': 'Both schema_name and json_data are required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if schema with the same name exists for this user
    existing_schema = collection.find_one({
        'user_id': str(request.user.id),
        'schema_name': schema_name
    })

    if existing_schema:
        return Response({'error': 'A schema with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    new_schema = {
        'user_id': str(request.user.id),
        'schema_name': schema_name,
        'json_data': json_data,
        'created_at': timezone.now()
    }

    result = collection.insert_one(new_schema)

    if result.inserted_id:
        new_schema['_id'] = str(result.inserted_id)
        return Response(new_schema, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'Failed to save schema'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

"""
class ConvertJsonToBson(APIView):
    def post(self, request):
        try:
            request_data = json.loads(request.body.decode('utf-8'))
            json_data = request_data.get('data')

            if not json_data:
                return HttpResponseBadRequest("No data provided")

            bson_data = bson.BSON.encode({"data": json_data})
            bson_str = bson_data.hex()

            return JsonResponse({'converted_data': bson_str})
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON")
        except Exception as e:
            return HttpResponseBadRequest(str(e))


class ConvertBsonToJson(APIView):
    def post(self, request):
        try:
            request_data = json.loads(request.body.decode('utf-8'))
            bson_str = request_data.get('bson_data')

            if not bson_str:
                return HttpResponseBadRequest("No BSON data provided")

            bson_data = bytes.fromhex(bson_str)
            json_data = bson.BSON.decode(bson_data)

            return JsonResponse({'converted_data': json_data})
        except bson.errors.InvalidBSON:
            return HttpResponseBadRequest("Invalid BSON data")
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid request format")
        except Exception as e:
            return HttpResponseBadRequest(str(e))


"""


@api_view(['POST'])
def convert(request):
    try:
        data = request.data.get('data', '')
        file_type = request.data.get('fileType', 'json')

        if file_type == 'json':
            # Convert JSON to BSON
            json_data = json.loads(data)
            bson_data = bson.BSON.encode(json_data)
            # Return the BSON data as a base64-encoded string or hex for easier display
            converted_data = bson_data.hex()  # For display in the frontend
            return JsonResponse({'converted_data': converted_data}, status=200)
        
        elif file_type == 'bson':
            # Convert BSON to JSON
            # The input should be a hex string that represents BSON data
            bson_data = bytes.fromhex(data)
            json_data = bson.BSON(bson_data).decode()
            return JsonResponse({'converted_data': json.dumps(json_data, indent=2)}, status=200)
        
        else:
            return JsonResponse({'error': 'Unsupported file type'}, status=400)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)




# ------------------------------
# ----- Document Generation ------
def generate_single_document(schema):
    prompt = f"""
    Generate a valid, unique sample JSON document based on the following schema: {json.dumps(schema)}.
    Use the currentValue: {schema.get("currentValue", 1)} for autoIncrement fields.
    Ensure that:
    1. All fields, such as names, addresses, phone numbers, dates, and any other attributes, are randomly generated and unique across multiple samples.
    2. Avoid using common or placeholder names such as 'John Doe' or 'Jane Smith.' Instead, generate names from diverse cultures (e.g., East Asian, South Asian, European, African, and Latin American names).
    3. Generate diverse and realistic addresses from different countries and regions, ensuring that postal codes, states, and cities are coherent and vary in each sample.
    4. All dates are formatted properly (e.g., ISO 8601 format) and are plausible within a recent timeframe (e.g., within the past 10 years).
    5. The document must strictly follow the schema and be output in valid JSON format without any extra text or explanations.
    6. If the description field mentions 'unique', then for every document generated, that property MUST be unique in respect to the other generated documents.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a JSON document generator."},
                {"role": "user", "content": prompt}
            ]
        )

        document_content = response.choices[0].message.content
        logger.info(f"Raw response: {document_content}")

        # Attempt to parse JSON from the response
        document_content = document_content.strip()
        json_start = document_content.find('{')
        json_end = document_content.rfind('}') + 1
        if json_start != -1 and json_end != -1:
            json_str = document_content[json_start:json_end]
            document = json.loads(json_str)
            return document
        else:
            raise ValueError("No valid JSON object found in the response.")
    except (json.JSONDecodeError, ValueError) as decode_error:
        logger.error(f"Failed to parse JSON: {decode_error}")
        raise Exception("Failed to parse generated JSON document.")
    except Exception as e:
        logger.error(f"Error generating document: {str(e)}")
        raise Exception(f"Error generating document: {str(e)}")


def update_schema(schema, auto_increment_values):
    """
    Update schema with the current values for autoIncrement fields.
    """
    # Make a copy of the schema to avoid changing the original
    updated_schema = copy.deepcopy(schema)

    # Go through each property in the schema
    for key, value in updated_schema.get("properties", {}).items():
        # If it's an autoIncrement field, set the start value
        if value.get("dataType") == "autoIncrement":
            if key not in auto_increment_values:
                auto_increment_values[key] = value.get("startValue", 1)  # Set start value if not already set
            value["startValue"] = auto_increment_values[key]

        # If it's an object, update its properties recursively
        if value.get("type") == "object":
            value["properties"] = update_schema(value, auto_increment_values).get("properties", {})

    return updated_schema


def generate_documents(schema, num_docs=1):
    """
    Generates multiple unique documents.
    """
    generated_documents = []
    auto_increment_values = {}  # Track the current value of each autoIncrement field

    for _ in range(num_docs):
        # Update schema with the current values for autoIncrement fields
        updated_schema = update_schema(schema, auto_increment_values)

        try:
            # Generate a document using the updated schema
            document = generate_single_document(updated_schema)
            generated_documents.append(document)

            # Increment auto-increment values for the next document
            for key in auto_increment_values:
                auto_increment_values[key] += 1

        except Exception as e:
            logger.error(f"Error generating document: {e}")

    success_count = len(generated_documents)
    failure_count = num_docs - success_count

    return generated_documents, success_count, failure_count


# Data types available for document generation
DATA_TYPES = [
    {"value": "names", "label": "Names", "type": "string"},
    {"value": "phoneFax", "label": "Phone / Fax", "type": "string"},
    {"value": "email", "label": "Email", "type": "string"},
    {"value": "date", "label": "Date", "type": "string", "format": "date"},
    {"value": "time", "label": "Time", "type": "string", "format": "time"},
    {"value": "company", "label": "Company", "type": "string"},
    {"value": "streetAddress", "label": "Street Address", "type": "string"},
    {"value": "city", "label": "City", "type": "string"},
    {"value": "postalZip", "label": "Postal / Zip", "type": "string"},
    {"value": "region", "label": "Region", "type": "string"},
    {"value": "country", "label": "Country", "type": "string"},
    {"value": "latitudeLongitude", "label": "Latitude/Longitude", "type": "array", "items": {"type": "number"}},
    {"value": "fixedNumberOfWords", "label": "Fixed Number of Words", "type": "integer"},
    {"value": "randomNumber", "label": "Random Number", "type": "integer"},
    {"value": "alphanumeric", "label": "Alphanumeric", "type": "string"},
    {"value": "boolean", "label": "Boolean", "type": "boolean"},
    {"value": "autoIncrement", "label": "Auto Increment", "type": "integer"},
    {"value": "numberRange", "label": "Number Range", "type": "number"},
    {"value": "normalDistribution", "label": "Normal Distribution", "type": "number"},
    {"value": "guid", "label": "GUID", "type": "string"},
    {"value": "constant", "label": "Constant", "type": "string"},
    {"value": "computed", "label": "Computed", "type": "string"},
    {"value": "list", "label": "List", "type": "array", "items": {"type": "string"}},
    {"value": "weightedList", "label": "Weighted List", "type": "array", "items": {"type": "string"}},
    {"value": "colour", "label": "Colour", "type": "string"},
    {"value": "url", "label": "URL", "type": "string", "format": "url"},
    {"value": "currency", "label": "Currency", "type": "string"},
    {"value": "bankAccountNums", "label": "Bank Account Numbers", "type": "string"},
    {"value": "cvv", "label": "CVV", "type": "integer"},
    {"value": "pin", "label": "PIN", "type": "integer"},
    {"value": "object", "label": "Object", "type": "object"},
    {"value": "array", "label": "Array", "type": "array"}
]


class DataTypeList(APIView):
    """
    Handle GET requests to return the available data types to the frontend.
    """

    def get(self, request):
        return Response(DATA_TYPES, status=status.HTTP_200_OK)


class GenerateDocumentView(APIView):
    """
    This view handles POST requests to generate documents based on the JSON schema provided by the front-end.
    """

    def post(self, request):
        try:
            schema = request.data.get('schema')
            num_samples = int(request.data.get('num_samples', 1))
            format_type = request.data.get('format', 'json')

            if not schema:
                return Response({'error': 'Schema is required.'}, status=status.HTTP_400_BAD_REQUEST)

            if isinstance(schema, str):
                schema = json.loads(schema)

            documents, success_count, failure_count = generate_documents(schema, num_samples)

            response_data = {
                'documents': documents,
                'success_count': success_count,
                'failure_count': failure_count
            }

            if format_type.lower() == 'bson':
                response_data['documents'] = bson.BSON.encode({'documents': documents}).hex()

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error processing document generation: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ------------------------------
# ----- JSON Validation Views --
class ValidateJsonFileView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'status': 'error', 'message': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            file_content = file.read().decode('utf-8')
            json.loads(file_content)
            return Response({'status': 'success', 'message': 'Valid JSON file'}, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            return Response({'status': 'error', 'message': 'Invalid JSON file'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'status': 'error', 'message': f'Error processing file: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ValidateJsonTextView(APIView):
    def post(self, request):
        json_text = request.data.get('jsonText')
        if not json_text:
            return Response({'status': 'error', 'message': 'No JSON text provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            json.loads(json_text)
            return Response({'status': 'success', 'message': 'Valid JSON text'}, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            return Response({'status': 'error', 'message': 'Invalid JSON text'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'status': 'error', 'message': f'Error processing request: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
