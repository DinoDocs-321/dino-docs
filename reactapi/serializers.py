from rest_framework import serializers
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import serializers
from django.contrib.auth.models import User
from pymongo import MongoClient
from django.utils import timezone
from rest_framework import serializers
from bson import ObjectId
from django.db import connections



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


# from rest_framework import serializers
# from .models import UserSchema

# class UserSchemaSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserSchema
#         fields = ['schema_name', 'json_data', 'created_at', 'updated_at']

#     def create(self, validated_data):
#         # Automatically assign the logged-in user to the schema
#         user = self.context['request'].user
#         schema = UserSchema.objects.create(user=user, **validated_data)
#         return schema
