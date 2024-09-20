# Standard library imports
import json
import logging
import re
import bson

# Third-party imports
import concurrent.futures
from django.conf import settings
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
from pymongo import MongoClient



# Django imports
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.template.loader import render_to_string
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.db import connections

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
                    'user_id': user.id  # Accessing and returning the user's unique ID
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

# ------- save-json views ---------
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .mongodb_utils import get_collection
from django.utils import timezone

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_user_schema(request):
    collection = get_collection()

    schema_name = request.data.get('schema_name')
    json_data = request.data.get('json_data')

    if not schema_name or not json_data:
        return Response({'error': 'Both schema_name and json_data are required'}, status=status.HTTP_400_BAD_REQUEST)

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

import time

def handle_rate_limit_error(e):
    try:
        # Extract the retry time from the error message
        retry_after = float(re.search(r'try again in (\d+\.?\d*)s', str(e)).group(1))
        logging.info(f"Rate limit reached. Retrying in {retry_after} seconds.")
        time.sleep(retry_after)
    except Exception as parse_error:
        logging.error(f"Error parsing retry time: {parse_error}")
        time.sleep(5)  # Default wait time if parsing fails

# Modify the document generation function to include rate limit handling
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
            model="gpt-4-turbo",  # Switch to GPT-4-turbo for better performance and lower cost
            messages=[
                {"role": "system", "content": "You are a JSON document generator."},
                {"role": "user", "content": prompt}
            ]
        )



        document_content = response.choices[0].message.content
        logging.info(f"Raw response: {document_content}")  # Log the raw response for debugging

        # Attempt to extract and parse JSON from the response
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



# Function to generate multiple documents in parallel and count successes and failures
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
                        # Increment failure count and retry if document fails to generate
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

# Django view for handling document generation requests
@csrf_exempt
@require_POST
def generate_documents_view(request):
    """Handles POST requests to generate documents based on a JSON schema."""
    try:
        data = json.loads(request.body)
        schema = data.get('schema')
        output_format = data.get('format', 'json')
        num_samples = int(data.get('num_samples', 1))  # Ensure num_samples is an integer

        if not schema:
            return HttpResponseBadRequest("Schema is required.")

        # Convert schema string to dict if necessary
        if isinstance(schema, str):
            schema = json.loads(schema)

        # Generate documents using the OpenAI API and count successes and failures
        documents, success_count, failure_count = generate_documents(schema, num_samples)

        # Prepare the response data
        if output_format.lower() == 'json':
            response_data = {
                'documents': documents,
                'success_count': success_count,
                'failure_count': failure_count
            }
        elif output_format.lower() == 'bson':
            response_data = {
                'documents': bson.dumps(documents).hex(),
                'success_count': success_count,
                'failure_count': failure_count
            }
        else:
            return HttpResponseBadRequest("Invalid output format specified. Use 'json' or 'bson'.")

        return JsonResponse(response_data, safe=False)

    except Exception as e:
        logging.error(f"Failed to generate documents: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
