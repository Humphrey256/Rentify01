from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
import os

# Optional: Create a simple view for the root URL
def home(request):
    return HttpResponse("Welcome to Rentify API!")

urlpatterns = [
    path('admin/', admin.site.urls),  # Admin panel
    
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
    
    # Add media serving during development and production
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    
    # Define explicit routes for critical static files
    path('dist/output.css', 
         TemplateView.as_view(
             template_name='static/css/output.css',
             content_type='text/css'
         )),
    path('static/js/bundle.js', 
         TemplateView.as_view(
             template_name='static/js/bundle.js',
             content_type='application/javascript'
         )),
    
    # API root - accessible via /api/
    path('api/', home),
]

# Add a fallback route to serve frontend for all other paths - crucial for React Router
urlpatterns += [
    re_path(r'^(?!api/)(?!admin/)(?!static/)(?!media/).*$', 
            TemplateView.as_view(template_name='index.html'),
            name='frontend'),
]

# Debug-only static file serving
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static('/dist/', document_root=os.path.join(settings.BASE_DIR, 'build', 'dist'))
