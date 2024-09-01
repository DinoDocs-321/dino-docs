# reactapi/urls.py

from django.urls import path
from . import views
from .views import generate_documents_view
from .views import convert_json_to_bson
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('generate/', generate_documents_view, name='generate_documents'),
    path('token/', 
          jwt_views.TokenObtainPairView.as_view(), 
          name ='token_obtain_pair'),
     path('token/refresh/', 
          jwt_views.TokenRefreshView.as_view(), 
          name ='token_refresh'),
    path('convert/', convert_json_to_bson, name='convert_json_to_bson'),
    # login url mapping here
    # create api endpoint url here for port 8000
]
