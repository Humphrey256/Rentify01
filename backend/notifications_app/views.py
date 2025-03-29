from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import Notification

class NotificationListView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensure token authentication is used
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user, is_read=False)
        data = [
            {
                "id": n.id,
                "message": n.message,
                "data": n.data,  # Include additional info
                "created_at": n.created_at,
            }
            for n in notifications
        ]
        return Response(data)

    def post(self, request):
        notification_id = request.data.get("id")
        Notification.objects.filter(id=notification_id, user=request.user).update(is_read=True)
        return Response({"status": "success"})
