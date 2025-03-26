from django.urls import path
from .views import RentalListView, RentalDetailView

urlpatterns = [
    path('', RentalListView.as_view(), name='rental-list'),  # List and create rentals
    path('<int:pk>/', RentalDetailView.as_view(), name='rental-detail'),  # Retrieve, update, and delete rentals
]
