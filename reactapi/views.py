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
client = OpenAI(api_key= os.getenv("OPENAI_API_KEY"))


# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def generate_single_document(schema):
    prompt = f"""
    Generate a unique sample JSON document based on the following schema: {json.dumps(schema)}.
    Ensure that all fields, such as names, addresses, phone numbers, and dates, are randomly generated, diverse, and unique. Avoid common names such as 'John Doe' or 'Jane Smith'.
    Use a variety of different names from different cultures.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a JSON document generator."},
                {"role": "user", "content": prompt}
            ]
        )

        document_content = response.choices[0].message.content

        # Attempt to extract and parse JSON from the response
        try:
            # Look for the first occurrence of valid JSON in the content
            json_match = re.search(r'\{.*\}', document_content, re.DOTALL)
            if json_match:
                document = json.loads(json_match.group())
                return document
            else:
                raise ValueError("No valid JSON found in the response.")
        except (json.JSONDecodeError, ValueError) as decode_error:
            logging.error(f"Failed to parse JSON: {decode_error}")
            raise Exception("Failed to parse generated JSON document.")
        
    except Exception as e:
        logging.error(f"Error generating document: {str(e)}")
        raise Exception(f"Error generating document: {str(e)}")

# Function to generate multiple documents in parallel
def generate_documents(schema: dict, num_docs: int = 1):
    """Generates multiple unique documents by making parallel API calls with retries."""
    generated_documents = []
    retries = 3

    while len(generated_documents) < num_docs and retries > 0:
        remaining_docs = num_docs - len(generated_documents)

        try:
            with concurrent.futures.ThreadPoolExecutor() as executor:
                futures = [executor.submit(generate_single_document, schema) for _ in range(remaining_docs)]
                for future in concurrent.futures.as_completed(futures):
                    try:
                        document = future.result()
                        generated_documents.append(document)
                        logging.info(f"Successfully generated document: {document}")
                    except Exception as e:
                        logging.error(f"Error generating document: {e}")
                        # Retry if document fails to generate
                        retries -= 1
                        if retries == 0:
                            logging.error(f"Max retries reached. Could not generate document.")
                        else:
                            logging.info(f"Retrying... {retries} retries left.")
                        continue

        except Exception as e:
            logging.error(f"Error in batch generation: {e}")

    return generated_documents


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

        # Generate documents using the OpenAI API
        documents = generate_documents(schema, num_samples)

        if output_format.lower() == 'json':
            response_data = documents
        elif output_format.lower() == 'bson':
            response_data = bson.dumps(documents).hex()
        else:
            return HttpResponseBadRequest("Invalid output format specified. Use 'json' or 'bson'.")

        return JsonResponse(response_data, safe=False)

    except Exception as e:
        logging.error(f"Failed to generate documents: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

# ----- .Schema form Views ------
# -------------------------------



