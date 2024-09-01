# reactapi/urls.py

from django.urls import path
from . import views
from rest_framework_simplejwt import views as jwt_views
from .views import generate_documents_view, CustomTokenObtainPairView, register_user, signin_view
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('generate/', generate_documents_view, name='generate_documents'),

        # Custom token obtain view to use email for authentication
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Default token refresh view
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name='register'),
    path('api/signin/', signin_view , name='signin'),

    # Other endpoints
    # path('login/', views.login_view, name='login'),
    # Add additional endpoints as needed
]
