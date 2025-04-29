import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from django.http import HttpResponse
import logging

logger = logging.getLogger('django')

# Optional: Create a simple view for the root URL
def home(request):
    return HttpResponse("Welcome to Rentify API!")

# Simple health check endpoint
def health_check(request):
    logger.info("Health check endpoint accessed")
    return HttpResponse("OK")

# Special handler for output.css to address the 500 error
def serve_css(request):
    logger.info("CSS file requested")
    css_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'build', 'dist', 'output.css')
    if os.path.exists(css_path):
        with open(css_path, 'r') as f:
            css_content = f.read()
        response = HttpResponse(css_content, content_type='text/css')
        return response
    else:
        logger.error(f"CSS file not found at {css_path}")
        # Return empty CSS if file doesn't exist
        return HttpResponse('/* CSS file not found */', content_type='text/css')

# Special handler for bundle.js to address the 520 error
def serve_bundle_js(request):
    logger.info("Bundle.js file requested")
    js_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'build', 'static', 'js', 'bundle.js')
    if os.path.exists(js_path):
        with open(js_path, 'r') as f:
            js_content = f.read()
        response = HttpResponse(js_content, content_type='application/javascript')
        return response
    else:
        logger.error(f"Bundle.js file not found at {js_path}")
        # Return minimal JS if file doesn't exist
        return HttpResponse('console.log("Bundle not found");', content_type='application/javascript')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('auth_app.urls')),
    path('api/', include('rentals_app.urls')),
    path('api/', include('booking_app.urls')),
    path('api/', include('reviews_app.urls')),
    path('api/', include('issues_app.urls')),
    path('api/', include('notifications_app.urls')),
    
    # Explicit static file serving
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    
    # Serve output.css directly
    re_path(r'^dist/output\.css$', serve, {
        'document_root': settings.BASE_DIR.parent / 'frontend' / 'build' / 'dist'
    }),
    
    # Catch-all for React frontend
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

# In development, use Django to serve media and static files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
