from django.http import HttpResponse
from django.shortcuts import render
from django.conf import settings


def home(request):
    print(settings.TEMPLATES[0]['DIRS'])  # This will print out the template directories Django is searching
    return render(request, 'home.html')
