from rest_framework import serializers
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import serializers
from django.contrib.auth.models import User
from pymongo import MongoClient



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'password')

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            username=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


# serializer
class UserSchemaSerializer(serializers.Serializer):
    schema_name = serializers.CharField(max_length=255, required=False, allow_blank=True)  # Optional schema name
    json_data = serializers.JSONField()  # Required JSON data
