# reactapi/urls.py

from django.urls import path
from . import views
from .views import generate_documents_view

urlpatterns = [
    path('generate/', generate_documents_view, name='generate_documents'),
]
