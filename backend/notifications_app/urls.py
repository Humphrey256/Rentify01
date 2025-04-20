from django.urls import path
from . import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken

class UnreadNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Retrieve the count of unread notifications for the authenticated user.
        """
        try:
            # Fetch unread notifications count for the authenticated user
            unread_count = views.Notification.objects.filter(user=request.user, is_read=False).count()
            return Response({'count': unread_count}, status=200)

        except Exception as e:
            # Log unexpected errors
            print(f"Error fetching unread notifications: {str(e)}")
            return Response({'detail': 'An error occurred while fetching unread notifications.'}, status=500)

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notifications'),
    path('unread/', views.unread_notification_count, name='notification-unread-count'),
    path('mark-all-read/', views.mark_all_as_read, name='mark-all-read'),
    path('unread-count/', views.UnreadNotificationsView.as_view(), name='unread-notifications-view'),
]
