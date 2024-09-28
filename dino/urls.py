from django.contrib import admin
from django.urls import include, path
from django.http import HttpResponse 
from . import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('reactapi.urls')),  # API endpoints
    path('', views.home, name='home'),
    # path('', include('reactapi.urls')),      # Add this if you want to directly map to root
]
