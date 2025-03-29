from django.db import models
from django.conf import settings  # Import settings to use AUTH_USER_MODEL

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")  # Updated to use AUTH_USER_MODEL
    message = models.TextField()
    data = models.JSONField(null=True, blank=True)  # Field to store additional info
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:20]}"
