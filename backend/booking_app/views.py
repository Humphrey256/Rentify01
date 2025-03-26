from rest_framework import generics
from .models import Booking
from .serializers import BookingSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import datetime
import uuid

class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        booking = serializer.data

        # Generate Flutterwave payment data
        tx_ref = str(uuid.uuid4())
        amount = booking['total_price']
        currency = 'USD'
        payment_options = 'card,banktransfer'
        redirect_url = 'http://localhost:3000/success'
        customer = {
            'email': request.user.email,
            'phonenumber': request.user.phone_number,
            'name': request.user.get_full_name(),
        }
        customizations = {
            'title': 'Rental Booking',
            'description': 'Payment for rental booking',
            'logo': 'https://your-logo-url.com/logo.png',
        }

        payment_data = {
            'tx_ref': tx_ref,
            'amount': amount,
            'currency': currency,
            'payment_options': payment_options,
            'redirect_url': redirect_url,
            'customer': customer,
            'customizations': customizations,
        }

        return Response(payment_data, status=status.HTTP_201_CREATED)

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

class ActiveBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user, end_date__gte=datetime.date.today())

class RentalHistoryView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user, end_date__lt=datetime.date.today())
