from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notifications'),
    path('unread/', views.unread_notification_count, name='notification-unread-count'),
    path('mark-all-read/', views.mark_all_as_read, name='mark-all-read'),
]
