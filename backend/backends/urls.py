from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
import os

# Optional: Create a simple view for the root URL
def home(request):
    return HttpResponse("Welcome to Rentify!")

urlpatterns = [
    path('admin/', admin.site.urls),  # Ensure this line is included
    
    # Social auth URLs - moved before API routes for priority
    path('auth/', include('auth_app.urls')),  # Your custom auth app
    path('social-auth/', include('social_django.urls', namespace='social')),  # Add this line
    # path('oauth/', include('drf_social_oauth2.urls', namespace='oauth2')),  # Temporarily commented out
    
    # API routes
    path('api/auth/', include('auth_app.urls')),  # API endpoints for auth
    path('api/rentals/', include('rentals_app.urls')),  # Rentals API
    path('api/bookings/', include('booking_app.urls')),  # Bookings API
    path('api/reviews/', include('reviews_app.urls')),  # Reviews API
    path('api/issues/', include('issues_app.urls')),  # Issues API
    path('api/notifications/', include('notifications_app.urls')),  # Notifications API
    
    path('', home),  # Simple home page
    
    # Add this line to serve media files in both development and production
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
]

# Add media URL only in debug mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
