import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
import logging
import mimetypes

# Ensure proper MIME types are registered
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")

logger = logging.getLogger('django')

# API documentation view
def api_docs(request):
    return JsonResponse({
        "message": "Rentify API Documentation",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/",
            "rentals": "/api/rentals/",
            "bookings": "/api/bookings/",
            "reviews": "/api/reviews/",
            "issues": "/api/issues/",
            "notifications": "/api/notifications/"
        }
    })

# Health check endpoint
def health_check(request):
    logger.info("Health check endpoint accessed")
    return JsonResponse({"status": "OK", "message": "Server is running"})

# Special direct handler for CSS files that doesn't redirect
def serve_css(request):
    # Extract path from request
    path = request.path.lstrip('/')
    logger.info(f"CSS direct handler for: {path}")
    
    # Get query parameters (for cache busting)
    query_params = request.META.get('QUERY_STRING', '')
    if query_params:
        logger.info(f"CSS query params: {query_params}")
    
    # Try multiple locations for output.css
    possible_paths = [
        os.path.join(settings.BASE_DIR, '..', 'frontend', 'build', 'dist', 'output.css'),
        os.path.join(settings.BASE_DIR, '..', 'frontend', 'dist', 'output.css'),
        os.path.join(settings.BASE_DIR, '..', 'frontend', 'build', 'static', 'css', 'output.css'),
        os.path.join(settings.STATIC_ROOT, 'css', 'output.css'),
        os.path.join(settings.STATIC_ROOT, 'dist', 'output.css')
    ]
    
    # Find the first existing CSS file
    css_path = None
    for path in possible_paths:
        if os.path.exists(path):
            css_path = path
            logger.info(f"Found CSS at: {css_path}")
            break
    
    if css_path:
        try:
            with open(css_path, 'r') as f:
                css_content = f.read()
            
            # Return the CSS with appropriate headers
            response = HttpResponse(css_content, content_type='text/css')
            response['Cache-Control'] = 'no-cache, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            response['Access-Control-Allow-Origin'] = '*'
            
            # Log successful response
            logger.info(f"CSS served successfully from {css_path}")
            return response
        except Exception as e:
            logger.error(f"Error reading CSS file: {str(e)}")
            return HttpResponse(f'/* Error loading CSS: {str(e)} */', content_type='text/css')
    else:
        logger.error("CSS file not found in any location")
        return HttpResponse('/* CSS file not found */', content_type='text/css')

# Enhanced JS bundler handler with better error handling
def serve_bundle_js(request):
    logger.info("JS file requested via custom handler")
    
    # Try to find the main JS file in the React build
    js_dir = os.path.join(settings.BASE_DIR, '..', 'frontend', 'build', 'static', 'js')
    main_js_file = None
    
    if os.path.exists(js_dir):
        # First look for files matching the webpack pattern
        for file in os.listdir(js_dir):
            if file.startswith('main.') and file.endswith('.js'):
                main_js_file = file
                break
        
        # Fallback to looking for bundle.js
        if not main_js_file:
            if 'bundle.js' in os.listdir(js_dir):
                main_js_file = 'bundle.js'
    
    if main_js_file:
        js_path = os.path.join(js_dir, main_js_file)
        logger.info(f"Serving JS from: {js_path}")
        try:
            with open(js_path, 'r') as f:
                js_content = f.read()
            response = HttpResponse(js_content, content_type='application/javascript')
            response['Cache-Control'] = 'no-cache, must-revalidate'
            response['Access-Control-Allow-Origin'] = '*'
            return response
        except Exception as e:
            logger.error(f"Error reading JS file: {str(e)}")
            return HttpResponse(f'console.error("Error loading bundle: {str(e)}");', 
                              content_type='application/javascript')
    else:
        if settings.DEBUG:
            logger.info("JS file not found, proxying to webpack dev server")
            return HttpResponse(
                'console.log("Bundle not found in Django static files");', 
                content_type='application/javascript'
            )
        else:
            logger.error("No main JS file found in build directory")
            return HttpResponse('console.error("JS bundle not found");', 
                              content_type='application/javascript')

# Advanced serve_index handler that respects React Router
def serve_index(request):
    logger.info(f"Serving index.html for path: {request.path}")
    index_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'build', 'index.html')
    
    if os.path.exists(index_path):
        try:
            with open(index_path, 'r') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/html')
        except Exception as e:
            logger.error(f"Error reading index.html: {str(e)}")
            return HttpResponse(f"Error loading React app: {str(e)}", content_type='text/html')
    else:
        if settings.DEBUG:
            return HttpResponse(
                """
                <html>
                <head><title>Frontend Not Built</title></head>
                <body>
                    <h1>Frontend not built yet</h1>
                    <p>Please run <code>cd frontend && npm run build</code> or access the frontend directly at <a href="http://localhost:3000">http://localhost:3000</a></p>
                </body>
                </html>
                """, 
                content_type='text/html'
            )
        else:
            logger.error("Frontend build not found!")
            return HttpResponse("Frontend build not found", content_type='text/html', status=500)

# Define URL patterns without the trailing slashes that cause redirects
urlpatterns = [
    # Admin and API endpoints
    path('admin/', admin.site.urls),
    path('api/docs/', api_docs, name='api_docs'),
    path('api/health/', health_check, name='health_check'),
    
    # API routing
    path('api/auth/', include('auth_app.urls')),
    path('api/rentals/', include('rentals_app.urls')),
    path('api/bookings/', include('booking_app.urls')),
    path('api/reviews/', include('reviews_app.urls')),
    path('api/issues/', include('issues_app.urls')),
    path('api/notifications/', include('notifications_app.urls')),
    
    # Legacy API paths (keep for backward compatibility)
    path('api/', include('auth_app.urls')),
    path('api/', include('rentals_app.urls')),
    path('api/', include('booking_app.urls')),
    path('api/', include('reviews_app.urls')),
    path('api/', include('issues_app.urls')),
    path('api/', include('notifications_app.urls')),
]

# CRITICAL: Add the CSS routes WITHOUT ending slash, which was causing 301 redirects
# Place these first as they need highest priority
css_patterns = [
    # Direct CSS handlers - these come first to avoid any redirects
    path('dist/output.css', serve_css),
    
    # CSS with query string parameters (very common in React builds)
    re_path(r'^dist/output\.css\?.*$', serve_css),
]

# Add CSS patterns at the beginning for highest priority
urlpatterns = css_patterns + urlpatterns

# JS handling
js_patterns = [
    path('static/js/bundle.js', serve_bundle_js),
    re_path(r'^static/js/main\.[a-z0-9]+\.js$', serve_bundle_js),
]

# Add JS patterns after CSS patterns
urlpatterns = urlpatterns + js_patterns

# Media and static files
media_static_patterns = [
    # Media files
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    
    # Static files
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    
    # Products images
    re_path(r'^products/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, '..', 'products')
    }),
    
    # Special route for handling manifest.json and favicon.ico
    path('manifest.json', serve, {
        'document_root': os.path.join(settings.BASE_DIR, '..', 'frontend', 'build'),
        'path': 'manifest.json'
    }),
    path('favicon.ico', serve, {
        'document_root': os.path.join(settings.BASE_DIR, '..', 'frontend', 'build'),
        'path': 'favicon.ico'
    }),
]

# Add media/static patterns
urlpatterns = urlpatterns + media_static_patterns

# Finally, add catch-all for React routes
urlpatterns.append(re_path(r'^(?!api/|admin/|static/|media/|dist/|products/).*$', serve_index))

# Add explicit index route at the root
urlpatterns.insert(0, path('', serve_index))

# Debug logging
if settings.DEBUG:
    logger.info(f"URL patterns configured, total count: {len(urlpatterns)}")
    # Don't add static() here as we're handling it manually above
