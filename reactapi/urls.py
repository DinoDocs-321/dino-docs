from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import generate_documents_view, RegisterUser, LoginUser

urlpatterns = [
    path('generate/', generate_documents_view, name='generate_documents'),
    
    # JWT Authentication paths
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User registration path
    path('signup/', RegisterUser.as_view(), name='register_user'),
    path('signin/', LoginUser.as_view(), name='signin'),

]
