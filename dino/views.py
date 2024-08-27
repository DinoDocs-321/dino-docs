from django.shortcuts import render
from django.views.generic import TemplateView


def index(request):
  return render(request, 'index.html')


class HomePageView(TemplateView):
    template_name = "index.html"
    

class AboutPageView(TemplateView):
    template_name = "about.html"