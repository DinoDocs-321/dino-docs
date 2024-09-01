from django.db import models

# Create your models here.
class JSONData(models.Model):
    json_data = models.JSONField()