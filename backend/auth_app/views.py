from django.shortcuts import redirect
from django.contrib.auth import authenticate
from .models import User
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
    role = request.data.get('role', 'user')

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
    from rest_framework_simplejwt.tokens import RefreshToken
    from django.shortcuts import redirect

    logger = logging.getLogger(__name__)

    if not user or not user.is_authenticated:
        logger.warning("Unauthenticated user attempted OAuth redirect")
        return redirect('http://localhost:3000/login')

    try:
        # Always assign 'user' role for OAuth logins
        user.role = 'user'
        user.save()

        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
        role = user.role

        logger.info(f"OAuth redirect successful for user: {user.username}, role: {role}, token: {token}")

        return redirect(f'http://localhost:3000/auth-success?token={token}&username={user.username}&role={role}')
    except Exception as e:
        logger.error(f"OAuth redirect error: {str(e)}")
        return redirect('http://localhost:3000/login')

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
    code = request.data.get('code')
    if not code:
        return Response({'error': 'Missing code'}, status=400)

    token_url = 'https://api.instagram.com/oauth/access_token'
    data = {
        'client_id': INSTAGRAM_CLIENT_ID,
        'client_secret': INSTAGRAM_CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'redirect_uri': REDIRECT_URI,
        'code': code,
    }
    resp = requests.post(token_url, data=data)
    if resp.status_code != 200:
        return Response({'error': 'Failed to get access token', 'details': resp.json()}, status=400)

    access_data = resp.json()
    # Optionally, save access_data['access_token'] to the user's profile here

    return Response({'access_token': access_data.get('access_token'), 'user_id': access_data.get('user_id')})
