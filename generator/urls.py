# generator/urls.py
from django.urls import path
from .views import generate_documents

urlpatterns = [
    path('generate/', generate_documents, name='generate_documents'),

]
