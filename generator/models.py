from django.db import models

class SchemaRequest(models.Model):
    schema = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
