from rest_framework import serializers
from django.contrib.auth.models import User

from reactapi.models import JSONData

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

class JSONDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = JSONData
        fields = ['json_data']
