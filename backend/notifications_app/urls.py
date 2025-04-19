from django.urls import path
from . import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

class UnreadNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Debugging: Log the token
            auth_header = request.headers.get('Authorization', '')
            print(f"Authorization Header: {auth_header}")

            # Validate the token
            token = auth_header.split(' ')[1]
            AccessToken(token)  # This will raise an error if the token is invalid

            # Fetch unread notifications (example logic)
            unread_count = 5  # Replace with actual logic
            return Response({'count': unread_count}, status=200)

        except (InvalidToken, TokenError) as e:
            print(f"Token validation error: {str(e)}")
            return Response({'detail': 'Invalid token'}, status=403)

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notifications'),
    path('unread/', views.unread_notification_count, name='notification-unread-count'),
    path('mark-all-read/', views.mark_all_as_read, name='mark-all-read'),
]
