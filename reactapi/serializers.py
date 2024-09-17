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
class JSONSchemaSerializer(serializers.Serializer):
    schema_name = serializers.CharField(max_length=255)
    json_data = serializers.JSONField()  # Field to accept dynamic JSON data

    def create(self, validated_data):
        user = self.context['request'].user  # Get the authenticated user

        # Connect to MongoDB using PyMongo
        client = MongoClient(settings.DATABASES['default']['CLIENT']['host'])
        db = client[settings.DATABASES['default']['NAME']]  # Connect to the database

        # Insert the schema into the 'user_schemas' collection, using both user_id and email
        db['user_schemas'].insert_one({
            "user_id": str(user.id),  # Store the user ID as a string
            "email": user.email,      # Store the user's email
            "schema_name": validated_data['schema_name'],
            "json_data": validated_data['json_data'],
        })

        return validated_data
