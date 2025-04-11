from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import status
from .models import Notification
from rest_framework.decorators import api_view, permission_classes

class NotificationListView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensure token authentication is used
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve all notifications (both read and unread) for the authenticated user.
        """
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        data = [
            {
                "id": n.id, 
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at
            } 
            for n in notifications
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Mark a notification as read.
        """
        notification_id = request.data.get("id")
        if not notification_id:
            return Response({"error": "Notification ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"status": "success", "message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notification_count(request):
    """Get count of unread notifications for the current user"""
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({"count": count})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
    """Mark all unread notifications as read for the current user"""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"status": "success"}, status=status.HTTP_200_OK)
