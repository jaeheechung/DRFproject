from rest_framework import generics
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Information
from .serializers import InfoSerializer

# Handle POST requests to create new Information entries
class InformationCreateView(viewsets.ModelViewSet):
    def post(self, request, *args, **kwargs):
        serializer = InfoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Handle GET requests to retrieve all Information entries
class InformationListView(viewsets.ModelViewSet):
    queryset = Information.objects.all()
    serializer_class = InfoSerializer