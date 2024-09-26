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