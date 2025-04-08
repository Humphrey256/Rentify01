from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

# Optional: Create a simple view for the root URL
def home(request):
    return HttpResponse("Welcome to Rentify!")

urlpatterns = [
    path('admin/', admin.site.urls),  # Ensure this line is included
    
    # Social auth URLs - moved before API routes for priority
    path('auth/', include('drf_social_oauth2.urls')),
    path('social-auth/', include('social_django.urls', namespace='social')),
    path('oauth/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    
    # API routes
    path('api/auth/', include('auth_app.urls')),
    path('api/rentals/', include('rentals_app.urls')),
    path('api/bookings/', include('booking_app.urls')),
    path('api/reviews/', include('reviews_app.urls')),
    path('api/issues/', include('issues_app.urls')),
    path('api/notifications/', include('notifications_app.urls')),
    
    path('', home),  # Simple home page
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
