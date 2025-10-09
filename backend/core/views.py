from rest_framework import generics
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Information
from .serializers import InfoSerializer

# Handle POST requests to create new Information entries
class InformationCreateView(generics.ListCreateAPIView):
    queryset = Information.objects.all()
    serializer_class = InfoSerializer

# Handle GET requests to retrieve all Information entries
class InformationListView(generics.ListAPIView):
    queryset = Information.objects.all()
    serializer_class = InfoSerializer
