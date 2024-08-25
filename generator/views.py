from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .forms import SchemaForm
import json
import bson
import openai

# Set your OpenAI API key
openai.api_key = 'sk-AisFq8U9Y-LsoxtyMIluzI7yAWmLq81Ercf15SHJaHT3BlbkFJHkhcWsvYbZI2x5IlF9l8nrvdLBA7FBuCJQP7gtLBwAs'

@csrf_exempt
def generate_documents(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        json_schema = data.get('schema')
        output_format = data.get('format', 'json')
        num_samples = data.get('num_samples', 10)

        if not json_schema:
            return JsonResponse({"error": "No JSON schema provided."}, status=400)

        # Generate sample documents logic...
        generated_samples = [{"sample": "data"}]  # Placeholder response

        if output_format == 'json':
            return JsonResponse(generated_samples, safe=False)
        else:
            return JsonResponse({"error": "Invalid output format."}, status=400)

    return JsonResponse({"error": "Only POST method is allowed"}, status=405)


def generate_sample_documents(json_schema, num_samples):
    generated_samples = []
    for _ in range(num_samples):
        response = openai.Completion.create(
            engine="text-davinci-003",  # or another appropriate model
            prompt=f"Generate a JSON document based on this schema: {json_schema}",
            max_tokens=500
        )
        sample_document = response.choices[0].text.strip()
        generated_samples.append(json.loads(sample_document))
    return generated_samples

def export_bson_documents(generated_samples):
    bson_samples = [bson.dumps(sample) for sample in generated_samples]
    return [bson_sample.hex() for bson_sample in bson_samples]

def schema_form_view(request):
    if request.method == 'POST':
        form = SchemaForm(request.POST)
        if form.is_valid():
            # Process form data
            pass
    else:
        form = SchemaForm()

    return render(request, 'generator/schema_form.html', {'form': form})
