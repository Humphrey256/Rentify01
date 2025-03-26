from django.urls import path
from .views import RegisterView, login, logout, UserListView, UserDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # Ensure trailing slash
    path('login/', login, name='login'),  # Ensure trailing slash
    path('logout/', logout, name='logout'),  # Ensure trailing slash
    path('users/', UserListView.as_view(), name='user-list'),  # List and create users
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),  # Retrieve, update, and delete users
]
