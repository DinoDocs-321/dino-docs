from django.db import models
from djongo import models
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.
class JSONData(models.Model):
    json_data = models.JSONField

    def __str__(self):
        return f"JSONData {self.json_data}"
