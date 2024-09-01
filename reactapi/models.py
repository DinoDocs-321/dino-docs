import json
import bson
import logging
import re
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from openai import OpenAI

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
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

# ----- .Login/Signup Views ------
# -------------------------------


# ----------------------------
# ----- JSON/BSON Views ------

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

            document_content = response.choices[0].message.content

            try:
                # Extract and parse JSON from the response
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

        if isinstance(schema, str):
            schema = json.loads(schema)

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

# ----- .JSON/BSON Views ------
# ----------------------------

# ------------------------------
# ----- Schema form Views ------

# Initialize OpenAI client
client = OpenAI(api_key="#key")

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ----- .Schema form Views ------
# -------------------------------
