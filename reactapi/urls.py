from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *


urlpatterns = [
    path('generate/', generate_documents_view, name='generate_documents'),

    # JWT Authentication paths
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User registration path
    path('signup/', RegisterUser.as_view(), name='register_user'),
    path('signin/', LoginUser.as_view(), name='signin'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-code/', VerifyCodeView.as_view(), name = "verify_code"),
    path('reset-password/', ResetPasswordView.as_view(), name = "reset-password"),
    path('convert/', ConvertJsonToBson.as_view(), name='convert-json-schema-to-bson'),
    path('send-test-email/', send_test_email, name='send_test_email'),


]

