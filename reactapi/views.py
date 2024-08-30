import json
import logging
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from openai import OpenAI
import bson



# -------------------------------
# ----- Login/Signup Views ------

# create your views here

# ----- .Login/Signup Views ------
# -------------------------------




# ----------------------------
# ----- JSON/BSON Views ------

# create your views here

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



