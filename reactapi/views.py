import json
import logging
import re
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
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
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

# Initialize OpenAI client
client = OpenAI(api_key="#key")

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def generate_documents(schema: dict, num_docs: int = 1):
    """Generates multiple unique documents by making separate API calls for each document."""
    generated_documents = []

    try:
        for _ in range(num_docs):
            prompt = f"Generate a unique sample JSON document based on the following schema: {json.dumps(schema)}"
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a JSON document generator."},
                    {"role": "user", "content": prompt}
                ]
            )

            # Access the content correctly using dot notation
            document_content = response.choices[0].message.content

            # Attempt to extract and parse JSON from the response
            try:
                # Look for the first occurrence of valid JSON in the content
                json_match = re.search(r'\{.*\}', document_content, re.DOTALL)
                if json_match:
                    document = json.loads(json_match.group())
                    generated_documents.append(document)
                    logging.info(f"Successfully generated document: {document}")
                else:
                    raise ValueError("No valid JSON found in the response.")

            except (json.JSONDecodeError, ValueError) as decode_error:
                logging.error(f"Failed to parse JSON: {decode_error}")
                raise Exception("Failed to parse generated JSON document.")

        return generated_documents

    except Exception as e:
        error_message = str(e).split(':')[-1].strip()
        logging.error(f"Error generating documents using OpenAI API: {error_message}")
        raise Exception(error_message)

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



