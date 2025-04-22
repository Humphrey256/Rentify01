from django.urls import path
from .views import register, login, logout, UserListView, UserDetailView, oauth_redirect, instagram_exchange
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),  # Ensure this is defined
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('oauth-redirect/', oauth_redirect, name='oauth_redirect'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('instagram/exchange/', instagram_exchange, name='instagram_exchange'),  # Instagram OAuth exchange endpoint
]
