from django.urls import path
from .views import NotificationListView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications'),  # Ensure this line is correct
]
