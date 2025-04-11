from django.urls import path
from .views import (
    BookingListCreateView, 
    BookingDetailView, 
    ActiveBookingsView, 
    RentalHistoryView, 
    CancelBookingView,
    CompleteBookingView
)

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking-list-create'),  # List and create bookings
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),  # Retrieve, update, and delete bookings
    path('active/', ActiveBookingsView.as_view(), name='active-bookings'),  # List active bookings
    path('history/', RentalHistoryView.as_view(), name='rental-history'),  # List rental history
    path('cancel/', CancelBookingView.as_view(), name='cancel-booking'),  # Cancel booking
    path('complete/', CompleteBookingView.as_view(), name='complete-booking'),  # Complete booking and return rental to inventory
]
