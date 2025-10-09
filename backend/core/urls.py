from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from core import views
from core.views import InformationCreateView, InformationListView

router = routers.DefaultRouter()
router.register(r'information', views.InformationListView, basename='information')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/information/list/', InformationListView.as_view(), name='information-list'),
    path('api/information/create/', InformationCreateView.as_view(), name='information-create'),
]
