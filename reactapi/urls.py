from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *


urlpatterns = [
    path('generate/', GenerateDocumentView.as_view(), name='generate_documents'),

    # JWT Authentication paths
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User registration path
    path('signup/', RegisterUser.as_view(), name='register_user'),
    path('signin/', LoginUser.as_view(), name='signin'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path('forgot-password/', ForgotPasswordRequest.as_view(), name='forgot_password'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordConfirm.as_view(), name='reset_password_confirm'),
    path('convert/', ConvertJsonToBson.as_view(), name='convert-json-schema-to-bson'),
    path('save-schema/', save_user_schema, name='save-schema'),

    #Generator paths
    path('data-types/', DataTypeList.as_view(), name='data-types'),
    path('generate-documents/', GenerateDocumentView.as_view(), name='generate_documents'),
    
    path('validate-json-file/', ValidateJsonTextView.as_view(), name='validate_json_file'),
    path('validate-json-text/', ValidateJsonTextView.as_view(), name='validate_json_text'),
]

