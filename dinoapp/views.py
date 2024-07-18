from django.shortcuts import render, HttpResponse
from django.views.generic import TemplateView # Import TemplateView


# Create your views here.

def home(request):
  return HttpResponse("Hello dinoapp")  

class HomePageView(TemplateView):
    template_name = "index.html"
    

class AboutPageView(TemplateView):
    template_name = "about.html"
