from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from .models import User
from .serializers import UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token  # Ensure this import is correct
from rest_framework import generics
import logging
from rest_framework_simplejwt.tokens import RefreshToken  # If using JWT for token generation

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role')  # Get the role from the request

        if not all([username, email, password, role]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.role = role
            user.save()
            token, _ = Token.objects.get_or_create(user=user)  # Generate token
            return Response({"message": "User created successfully", "token": token.key}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    logger.debug(f"Login attempt with username: {username}")

    if not username or not password:
        logger.error("Username and password are required")
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if user is not None:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'token': token.key
        }, status=status.HTTP_200_OK)
    else:
        logger.error("Invalid credentials")
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        request.auth.delete()  # Delete token to logout user
        return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

def oauth_redirect(backend, user, response, *args, **kwargs):
    """
    Custom pipeline function to handle OAuth redirect after successful authentication.
    """
    from rest_framework_simplejwt.tokens import RefreshToken
    from django.shortcuts import redirect
    import logging

    logger = logging.getLogger(__name__)

    # Check if the user is authenticated
    if not user or not user.is_authenticated:
        logger.warning("Unauthenticated user attempted OAuth redirect")
        return redirect('http://localhost:3000/login')  # Redirect to login if user is not authenticated

    try:
        # Generate a token (using JWT)
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)

        # Log the generated token for debugging
        logger.info(f"Generated token for user {user.username}: {token}")

        # Determine the user's role
        role = 'admin' if user.is_staff else 'user'

        logger.info(f"OAuth redirect successful for user: {user.username}, role: {role}, token: {token}")

        # Redirect to the frontend with token, username, and role as query parameters
        return redirect(f'http://localhost:3000/auth-success?token={token}&username={user.username}&role={role}')
    except Exception as e:
        logger.error(f"OAuth redirect error: {str(e)}")
        return redirect('http://localhost:3000/login')  # Redirect to login on error