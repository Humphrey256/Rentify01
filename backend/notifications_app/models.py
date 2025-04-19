from django.db import models
from django.conf import settings  # Import settings to use AUTH_USER_MODEL

class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="notifications"
    )
    message = models.TextField()
    data = models.JSONField(null=True, blank=True)  # Optional additional data for the notification
    is_read = models.BooleanField(default=False)  # Indicates whether the notification has been read
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for when the notification was created

    def mark_as_read(self):
        """Mark the notification as read."""
        self.is_read = True
        self.save()

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"
