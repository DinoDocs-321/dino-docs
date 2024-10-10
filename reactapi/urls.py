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

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('verify-code/', VerifyCodeView.as_view(), name = "verify_code"),
    # path('convert/', ConvertJsonToBson.as_view(), name='convert-json-schema-to-bson'),
    path('convert/', convert, name='convert'),
    path('save-schema/', save_user_schema, name='save-schema'),



    #Generator paths
    path('data-types/', DataTypeList.as_view(), name='data-types'),
    path('generate-documents/', GenerateDocumentView.as_view(), name='generate_documents'),

    path('validate-json-file/', ValidateJsonFileView.as_view(), name='validate_json_file'),
    path('validate-json-text/', ValidateJsonTextView.as_view(), name='validate_json_text'),

    path('saved-schemas/', list_user_schemas, name='list_saved_schemas'),
    path('saved-schemas/<str:schema_id>/', user_schema_detail, name='user_schema_detail'),
    path('saved-schemas/<str:schema_id>/', delete_user_schema, name='delete_saved_schema'),
]

