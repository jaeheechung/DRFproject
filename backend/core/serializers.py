from rest_framework import serializers
from .models import Information

class InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Information
        fields = ['temperature', 'humidity', 'battery', 'byteMV', 'timestamp']