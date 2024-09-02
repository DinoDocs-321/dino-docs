# reactapi/urls.py

from django.urls import path
from . import views
from .views import *
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('generate/', generate_documents_view, name='generate_documents'),
    path('token/', 
          jwt_views.TokenObtainPairView.as_view(), 
          name ='token_obtain_pair'),
     path('token/refresh/', 
          jwt_views.TokenRefreshView.as_view(), 
          name ='token_refresh'),
    path('convert/', ConvertJsonToBson.as_view(), name='convert-json-schema-to-bson'),
    # login url mapping here
    # create api endpoint url here for port 8000
]

