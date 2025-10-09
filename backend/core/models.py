from django.db import models

# Create your models here.
class Information(models.Model):
    temperature = models.FloatField()
    humidity = models.FloatField()
    battery = models.FloatField()
    mVbatt = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    