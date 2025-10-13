from django.db import models

# Create your models here.
class Information(models.Model):
    temperature = models.FloatField()
    humidity = models.FloatField()