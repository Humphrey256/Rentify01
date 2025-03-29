from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

# Optional: Create a simple view for the root URL
def home(request):
    return HttpResponse("Welcome to Rentify!")

urlpatterns = [
    path('', home),  # Redirect the root URL to a simple home page
    path('admin/', admin.site.urls),  # Ensure this line is included
    path('api/auth/', include('auth_app.urls')),  # Ensure this line includes the auth routes
    path('api/rentals/', include('rentals_app.urls')),  # Ensure this line includes the rentals routes
    path('api/bookings/', include('booking_app.urls')),  # Ensure this line includes the booking routes
    path('api/reviews/', include('reviews_app.urls')),  # Ensure this line includes the review routes
    path('api/issues/', include('issues_app.urls')),  # Ensure this line includes the issue routes
    path('api/notifications/', include('notifications_app.urls')),  # Ensure this line is correct
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
