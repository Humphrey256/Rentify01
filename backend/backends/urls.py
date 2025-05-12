from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse, HttpResponseRedirect
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os
import json

# Load external image map for fallbacks
image_map = {}
try:
    with open(os.path.join(settings.BASE_DIR, 'media-config.json')) as f:
        image_map = json.load(f).get('image_map', {})
except (FileNotFoundError, json.JSONDecodeError) as e:
    print(f"Warning: Could not load media-config.json: {e}")

# Custom media server with external fallbacks
def media_serve(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    
    # If file exists locally, serve it normally
    if os.path.exists(file_path):
        print(f"Serving local file: {path}")
        return serve(request, path, document_root=settings.MEDIA_ROOT)
    
    # If it's a rental image, check the image map for external URL
    if path.startswith('rentals/'):
        filename = os.path.basename(path)
        if filename in image_map:
            external_url = image_map[filename]
            print(f"Redirecting to external image: {external_url}")
            return HttpResponseRedirect(external_url)
    
    # No valid fallback found, return a 404
    print(f"File not found: {path}")
    return HttpResponse(f"File not found: {path}", status=404)

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
    
    # Media URL with fallback mechanism
    path('media/<path:path>', media_serve),
]

# Add media URL only in debug mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
