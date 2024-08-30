from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin/', admin.site.urls),
    path('api/', include('reactapi.urls')),  # API endpoints
    # path('', include('reactapi.urls')),      # Add this if you want to directly map to root
]
