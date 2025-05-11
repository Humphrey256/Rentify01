from django.shortcuts import redirect
from django.contrib.auth import authenticate
from .models import User
from notifications_app.models import Notification
from .serializers import UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import logging
import os
import requests
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

INSTAGRAM_CLIENT_ID = os.environ.get('INSTAGRAM_CLIENT_ID')
INSTAGRAM_CLIENT_SECRET = os.environ.get('INSTAGRAM_CLIENT_SECRET')
REDIRECT_URI = os.environ.get('INSTAGRAM_REDIRECT_URI', 'http://localhost:3000/instagram-auth')

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    # Force role to be 'user' regardless of what was sent in the request
    role = 'user'  # Hardcoded to 'user' - ignoring any role from request

    if not all([username, email, password]):
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        user.role = role
        user.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "message": "User created successfully",
            "token": access_token,
            "refresh": str(refresh),
            "role": user.role
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response({"error": "An error occurred during registration"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    logger.debug(f"Login attempt with username: {username}")

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'token': access_token,
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)
    else:
        logger.error("Invalid credentials")
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework_simplejwt.exceptions import TokenError

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    logger.debug("Logout endpoint accessed")
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            logger.error("No refresh token provided")
            return Response({"error": "Refresh token is required for logout"}, status=400)

        token = RefreshToken(refresh_token)
        token.blacklist()  # Blacklist the refresh token

        logger.info("Refresh token blacklisted successfully")
        return Response({"message": "Successfully logged out"}, status=205)
    except TokenError as e:
        logger.error(f"Invalid or expired token: {str(e)}")
        return Response({"error": "Invalid or expired token"}, status=400)
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response({"error": str(e)}, status=400)

class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

def oauth_redirect(backend, user, response, *args, **kwargs):
    from django.shortcuts import redirect
    from rest_framework_simplejwt.tokens import RefreshToken
    import logging

    logger = logging.getLogger(__name__)

    FRONTEND_LOGIN_URL = "https://rentify01-yfnu.onrender.com/login"

    try:
        if not user or not user.is_authenticated:
            logger.warning("Unauthenticated user attempted OAuth redirect")
            return redirect(FRONTEND_LOGIN_URL)

        user.role = 'user'
        user.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        logger.info(f"OAuth redirect successful for user: {user.username}, role: {user.role}")

        # Redirect to frontend login page with tokens as query params
        return redirect(f"{FRONTEND_LOGIN_URL}?token={access_token}&refresh={refresh_token}&role={user.role}")
    except Exception as e:
        logger.error(f"OAuth redirect error: {str(e)}")
        return redirect(FRONTEND_LOGIN_URL)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notifications(request):
    user = request.user
    # Assuming you have a Notification model with a `read` field
    unread_count = Notification.objects.filter(user=user, read=False).count()
    return Response({"count": unread_count}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def instagram_exchange(request):
    """Exchange Instagram auth code for access token"""
    code = request.data.get('code')
    if not code:
        return Response({'error': 'Missing authorization code'}, status=400)

    # Instagram app credentials (from env vars)
    client_id = os.getenv('INSTAGRAM_CLIENT_ID')
    client_secret = os.getenv('INSTAGRAM_CLIENT_SECRET')
    redirect_uri = os.getenv('INSTAGRAM_REDIRECT_URI', f"{request.scheme}://{request.get_host()}/instagram-callback")

    # Exchange code for token
    token_url = 'https://api.instagram.com/oauth/access_token'
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'authorization_code',
        'redirect_uri': redirect_uri,
        'code': code
    }
    
    try:
        response = requests.post(token_url, data=data)
        if response.status_code != 200:
            logger.error(f"Instagram token exchange failed: {response.text}")
            return Response({'error': 'Failed to get access token'}, status=400)
            
        token_data = response.json()
        access_token = token_data.get('access_token')
        user_id = token_data.get('user_id')
        
        # Save token to user
        user = request.user
        user.instagram_token = access_token
        user.instagram_user_id = user_id
        user.save()
        
        return Response({'success': True})
    except Exception as e:
        logger.error(f"Instagram exchange error: {str(e)}")
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instagram_status(request):
    """Check if user has connected Instagram account"""
    user = request.user
    connected = hasattr(user, 'instagram_token') and bool(user.instagram_token)
    return Response({'connected': connected})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instagram_feed(request):
    """Get Instagram posts for authenticated user"""
    user = request.user
    
    if not hasattr(user, 'instagram_token') or not user.instagram_token:
        return Response({'error': 'Instagram account not connected'}, status=400)
    
    try:
        access_token = user.instagram_token
        endpoint = f"https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token={access_token}"
        
        response = requests.get(endpoint)
        if response.status_code != 200:
            logger.error(f"Instagram API request failed: {response.text}")
            return Response({'error': 'Failed to fetch Instagram data'}, status=400)
        
        return Response(response.json())
    except Exception as e:
        logger.error(f"Instagram feed error: {str(e)}")
        return Response({'error': str(e)}, status=500)

def get_extra_emails(strategy, details, response, user=None, *args, **kwargs):
    # For Google, emails are in response['emails'] if available
    emails = []
    if 'emails' in response:
        emails = [email['value'] for email in response['emails']]
    elif 'email' in response:
        emails = [response['email']]
    # Store in session or pass to the next pipeline step
    strategy.session_set('extra_emails', emails)
    return {'extra_emails': emails}
