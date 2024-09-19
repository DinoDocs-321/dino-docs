# Standard library imports
import json
import logging
import re
import bson

# Third-party imports
import concurrent.futures
from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from openai import OpenAI
import bson
from reactapi.models import JSONData
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from openai import OpenAI

# Django imports
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.template.loader import render_to_string
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail


# Local application imports
from .serializers import UserSerializer



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

        if email is None or password is None:
            return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            user = authenticate(username=user.username, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get the refresh token from the request data
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)

            # Blacklist the refresh token, effectively logging out the user
            token.blacklist()

            return Response({"message": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordRequest(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = PasswordResetTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # You should configure your email settings in settings.py for this to work.
            mail_subject = 'Password Reset Request'
            message = render_to_string('password_reset_email.html', {
                'user': user,
                'domain': 'localhost:3000',  # Your frontend domain
                'uid': uid,
                'token': token,
            })
            send_mail(mail_subject, message, 'contact@sohamverma.com', [email])

            return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'Email does not exist'}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordConfirm(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            if PasswordResetTokenGenerator().check_token(user, token):
                new_password = request.data.get('password')
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Token is invalid or expired'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Invalid user'}, status=status.HTTP_404_NOT_FOUND)


# ----- .Login/Signup Views ------
# -------------------------------




# ----------------------------
# ----- JSON/BSON Views ------

# create your views here
class ConvertJsonToBson(APIView):
    def post(self, request):
        try:
            # Parsing JSON data from the request body
            request_data = json.loads(request.body.decode('utf-8'))
            json_data = request_data.get('data')


            if not json_data:
                return HttpResponseBadRequest("No data provided")

            # Convert JSON to BSON
            bson_data = bson.BSON.encode({"data": json_data})

            # Convert BSON to hexadecimal string for easy representation
            bson_str = bson_data.hex()

            return JsonResponse({'converted_data': bson_str})
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON")
        except Exception as e:
            return HttpResponseBadRequest(str(e))

# ----- .JSON/BSON Views ------
# ----------------------------





# ------------------------------
# ----- Schema form Views ------

import os
from dotenv import load_dotenv
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Rate limit error handler
def handle_rate_limit_error(e):
    try:
        retry_after = float(re.search(r'try again in (\d+\.?\d*)s', str(e)).group(1))
        logging.info(f"Rate limit reached. Retrying in {retry_after} seconds.")
        time.sleep(retry_after)
    except Exception as parse_error:
        logging.error(f"Error parsing retry time: {parse_error}")
        time.sleep(5)  # Default wait time if parsing fails


def generate_single_document(schema):
    prompt = f"""
    Generate a valid, unique sample JSON document based on the following schema: {json.dumps(schema)}.
Ensure that:
1. All fields, such as names, addresses, phone numbers, dates, and any other attributes, are randomly generated and unique across multiple samples.
2. Avoid using common or placeholder names such as 'John Doe' or 'Jane Smith.' Instead, generate names from diverse cultures (e.g., East Asian, South Asian, European, African, and Latin American names).
3. Generate diverse and realistic addresses from different countries and regions, ensuring that postal codes, states, and cities are coherent and vary in each sample.
4. All dates are formatted properly (e.g., ISO 8601 format) and are plausible within a recent timeframe (e.g., within the past 10 years).
5. The document must strictly follow the schema and be output in valid JSON format without any extra text or explanations.
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
        logging.info(f"Raw response: {document_content}")  # Log the raw response for debugging

        try:
            json_match = re.search(r'\{.*\}', document_content, re.DOTALL)
            if json_match:
                document = json.loads(json_match.group())
                return document
            else:
                raise ValueError("No valid JSON found in the response.")
        except (json.JSONDecodeError, ValueError) as decode_error:
            logging.error(f"Failed to parse JSON: {decode_error}")
            raise Exception("Failed to parse generated JSON document.")

    except OpenAI.RateLimitError as e:
        logging.error(f"Error generating document: {e}")
        handle_rate_limit_error(e)
        raise Exception(f"Rate limit hit. Retrying after pause.")
    except Exception as e:
        logging.error(f"Error generating document: {str(e)}")
        raise Exception(f"Error generating document: {str(e)}")


def generate_documents(schema: dict, num_docs: int = 1):
    """Generates multiple unique documents by making parallel API calls and counts successes and failures."""
    generated_documents = []
    retries = 3
    success_count = 0
    failure_count = 0

    while len(generated_documents) < num_docs and retries > 0:
        remaining_docs = num_docs - len(generated_documents)

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                futures = [executor.submit(generate_single_document, schema) for _ in range(remaining_docs)]
                for future in concurrent.futures.as_completed(futures):
                    try:
                        document = future.result()
                        generated_documents.append(document)
                        success_count += 1
                        logging.info(f"Successfully generated document: {document}")
                    except Exception as e:
                        logging.error(f"Error generating document: {e}")
                        failure_count += 1
                        retries -= 1
                        if retries == 0:
                            logging.error(f"Max retries reached. Could not generate document.")
                        else:
                            logging.info(f"Retrying... {retries} retries left.")
                        continue

        except Exception as e:
            logging.error(f"Error in batch generation: {e}")

    return generated_documents, success_count, failure_count


# Main View: Handles the initial request and internally calls the document generation logic
class GenerateDocumentView(APIView):
    """
    This view handles POST requests to generate documents based on the JSON schema provided by the front-end.
    """

    def post(self, request):
        try:
            # Extract data from the request
            rows = request.data.get('rows')
            num_samples = int(request.data.get('num_samples', 1))
            format_type = request.data.get('format', 'json')

            # Step 1: Create a valid JSON schema from rows (assuming you have this logic)
            schema = create_valid_json_schema(rows)

            # Step 2: Internally call the document generation logic (no need for separate URL)
            documents, success_count, failure_count = generate_documents(schema, num_samples)

            # Step 3: Prepare the response
            if format_type.lower() == 'json':
                response_data = {
                    'documents': documents,
                    'success_count': success_count,
                    'failure_count': failure_count
                }
            elif format_type.lower() == 'bson':
                response_data = {
                    'documents': bson.dumps(documents).hex(),
                    'success_count': success_count,
                    'failure_count': failure_count
                }
            else:
                return JsonResponse({'error': 'Invalid format specified. Use "json" or "bson".'}, status=400)

            return JsonResponse(response_data, status=200)

        except Exception as e:
            logging.error(f"Error processing document generation: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

# ----- Schema form Views ------
# ------------------------------



# ------------------------------
# -------Generate Views---------

#
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
    {"value": "object", "label": "Object", "type": "object"}

]

# Function to map the value of dataType to the corresponding structure in DATA_TYPES
def map_data_type(value):
    for data_type in DATA_TYPES:
        if data_type["value"] == value:
            return data_type
    return None  # Return None if no match is found

class GenerateData(APIView):
    """
    Handle POST requests to receive the schema and forward it to the AI generator.
    """

    def post(self, request):
        schema = request.data.get('schema', {})
        num_samples = int(request.data.get('num_samples', 10))
        format_type = request.data.get('format', 'json')

        # Here you would send 'schema' to your AI generator
        # For now, we'll just return the schema for confirmation

        # Example:
        # ai_generated_data = call_ai_generator(schema, num_samples, format_type)

        # For demonstration, we'll just return the schema
        return Response({'message': 'Schema received', 'schema': schema}, status=status.HTTP_200_OK)
    

# Function to create a valid JSON schema based on the rows received from the front-end
def create_valid_json_schema(rows):
    """
    Create a valid JSON schema based on the rows of data from the front-end.
    """

    # Base structure of the JSON schema
    json_schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "title": "Generated Schema",
        "description": "Schema generated based on user input",
        "properties": {},
        "required": []
    }

    # Iterate through each row to build the schema
    for row in rows:
        data_type_mapping = map_data_type(row.get("dataType"))

        if data_type_mapping:
            json_schema["properties"][row["keyTitle"]] = {
                "type": data_type_mapping["type"],
                "description": row.get("userPrompt", ""),
            }

            # Add additional keys like 'format' if they exist in the data type
            if "format" in data_type_mapping:
                json_schema["properties"][row["keyTitle"]]["format"] = data_type_mapping["format"]

            # Optionally, add examples
            if row.get("example"):
                json_schema["properties"][row["keyTitle"]]["example"] = row["example"]

            # Mark the field as required if it has a keyTitle
            json_schema["required"].append(row["keyTitle"])

    return json_schema

# Mock function to generate sample documents based on a schema
def generate_documents(schema, num_samples, format_type):
    """
    Mock function to generate sample documents based on a schema.
    Replace this with the actual AI or document generation logic.
    """
    documents = []
    for _ in range(num_samples):
        doc = {}
        for key, value in schema["properties"].items():
            # Generate simple mock data based on the type
            if value["type"] == "string":
                doc[key] = "Sample Text"
            elif value["type"] == "integer":
                doc[key] = 12345
            elif value["type"] == "boolean":
                doc[key] = True
            # You can expand this to handle other types, formats, etc.
        documents.append(doc)

    # Return the documents in the requested format (for now we assume JSON)
    return documents

class DataTypeList(APIView):
    """
    Handle GET requests to return the available data types to the frontend.
    """
    
    def get(self, request):
        # Return the available data types in a JSON response
        return Response(DATA_TYPES, status=status.HTTP_200_OK)

# -------Generate Views---------
# ------------------------------

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class ManualGenerate(View):
    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if file:
            return JsonResponse({'status': 'success', 'filename': file.name})
        return JsonResponse({'status': 'error', 'message': 'No file uploaded'}, status=400)

    def get(self, request, *args, **kwargs):
        return JsonResponse({'status': 'success', 'message': 'GET request received'})

