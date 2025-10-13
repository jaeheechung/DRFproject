from rest_framework import generics
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Information
from .serializers import InfoSerializer

# Handle POST requests to create new Information entries
class InformationCreateView(viewsets.ModelViewSet):
    queryset = Information.objects.all()
    serializer_class = InfoSerializer

# Handle GET requests to retrieve all Information entries
class InformationListView(viewsets.ModelViewSet):
    def list(self, request, *args, **kwargs):
        print("GET request received")
        try:
            queryset = Information.objects.all()
            serializer = InfoSerializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error retrieving data: {e}")
            return Response({"error": "Error retrieving data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)