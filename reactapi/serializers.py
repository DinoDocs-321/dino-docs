from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims (optional)
        token['email'] = user.email
        return token

    def validate(self, attrs):
        # Override the default validation to use email instead of username
        credentials = {
            'email': attrs.get('email'),
            'password': attrs.get('password')
        }

        user = User.objects.filter(email=credentials['email']).first()

        if user is None:
            raise serializers.ValidationError('No active account found with the given credentials')

        return super().validate(attrs)





class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True, max_length=30)
    last_name = serializers.CharField(required=True, max_length=30)
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(required=True, max_length=15)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    termsAccepted = serializers.BooleanField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'phone_number', 'password', 'confirm_password', 'termsAccepted')

    def validate_email(self, value):
        """Ensure email is unique."""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate(self, data):
        """Ensure passwords match and terms are accepted."""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        if not data.get('termsAccepted'):
            raise serializers.ValidationError("You must accept the terms and privacy policies.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # Remove confirm_password as it's not needed to create a user
        validated_data.pop('termsAccepted')  # Remove termsAccepted as it's not a user model field

        user = CustomUser(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data['phone_number']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
