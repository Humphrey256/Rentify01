
from django.urls import path
from .views import ReviewListCreateView, ReviewDetailView

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list-create'),  # List and create reviews
    path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),  # Retrieve, update, and delete reviews
]
