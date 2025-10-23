from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core import views
from .views import InformationCreateView, InformationListView

router = DefaultRouter()
router.register(r'information', InformationListView, basename='information')

urlpatterns = [
    # Expose the viewset routes at the app root. Project `my_project/urls.py`
    # already includes admin and mounts this app under /api/ if desired.
    path('', include(router.urls)),
]
