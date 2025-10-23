from django.db import models

# Create your models here.
class Information(models.Model):
    temperature = models.FloatField()
    humidity = models.FloatField()
    battery = models.FloatField(default=80.0)
    byteMV = models.FloatField(default=2800.0)
    timestamp = models.DateTimeField(auto_now_add=True, blank=True)