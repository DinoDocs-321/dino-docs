from django.urls import path
from dinoapp.views import ConvertView
from . import views

urlpatterns = [
    path('hello-world/', views.hello_world, name='hello_world'),
    path('api/convert/', ConvertView.as_view(), name='convert'),
]