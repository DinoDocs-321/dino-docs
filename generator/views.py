from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from openai import OpenAI

client = OpenAI(api_key='sk-6CxFr8GVnSv9wYp-F_5SsdzwRNjWfkrPFI0WbwucUIT3BlbkFJ08FTGm0XLlaMvMu3EPCo-lNT1uFHyaDR-6Asuoa50A')

# Set your OpenAI API key

@csrf_exempt
def generate_documents(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format in request body."}, status=400)

        json_schema = data.get('schema')
        output_format = data.get('format', 'json')
        num_samples = data.get('num_samples', 10)

        if not json_schema:
            return JsonResponse({"error": "No JSON schema provided."}, status=400)

        # Generate sample documents
        generated_samples = generate_sample_documents(json_schema, num_samples)

        if output_format == 'json':
            return JsonResponse(generated_samples, safe=False)
        else:
            return JsonResponse({"error": "Invalid output format."}, status=400)

    return JsonResponse({"error": "Only POST method is allowed"}, status=405)

def generate_sample_documents(json_schema, num_samples):
    generated_samples = []
    for _ in range(num_samples):
        try:
            response = client.chat.completions.create(model="gpt-3.5-turbo",  # Or use "gpt-4" if you have access
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Generate a JSON document based on this schema: {json_schema}"}
            ],
            max_tokens=500)
            sample_document = response.choices[0].message.content.strip()
            try:
                sample_json = json.loads(sample_document)
                generated_samples.append(sample_json)
            except json.JSONDecodeError as json_error:
                print(f"JSON decode error: {json_error}")
                generated_samples.append({"error": "Failed to generate valid JSON document"})
        except Exception as e:
            print(f"An error occurred during document generation: {e}")
            generated_samples.append({"error": f"Error during document generation: {e}"})
    return generated_samples



def schema_form_view(request):
    if request.method == 'POST':
        form = SchemaForm(request.POST)
        if form.is_valid():
            # Process form data
            pass
    else:
        form = SchemaForm()

    return render(request, 'generator/schema_form.html', {'form': form})
