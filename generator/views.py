import json
import logging
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from openai import OpenAI
import bson

# Initialize OpenAI client
client = OpenAI(api_key="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")

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def generate_documents(schema: dict, num_docs: int = 1):
    """Generates documents based on a schema using the OpenAI API."""
    try:
        prompt = f"Generate {num_docs} sample JSON document(s) based on the following schema: {json.dumps(schema)}"
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a JSON document generator."},
                {"role": "user", "content": prompt}
            ]
        )
        
        generated_documents = [json.loads(choice.message.content) for choice in response.choices]
        logging.info(f"Successfully generated {len(generated_documents)} document(s) using the OpenAI API")
        return generated_documents

    except Exception as e:
        # Extract the specific error message
        error_message = str(e).split(':')[-1].strip()
        logging.error(f"Error generating documents using OpenAI API: {error_message}")
        raise Exception(error_message)  # Raise the specific error message

@csrf_exempt
@require_POST
def generate_documents_view(request):
    """Handles POST requests to generate documents based on a JSON schema."""
    try:
        data = json.loads(request.body)
        schema = data.get('schema')
        output_format = data.get('format', 'json')
        num_samples = data.get('num_samples', 1)

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
