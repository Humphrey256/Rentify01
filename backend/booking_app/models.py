from django.db import models
from auth_app.models import User
from rentals_app.models import Rental
from datetime import datetime, date, timedelta
from decimal import Decimal
import uuid

from django.core.mail import send_mail
from django.utils.timezone import now
from django.core.exceptions import ValidationError

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import APIException

# Import the notification model
from notifications_app.models import Notification

# Constants
VALID_PAYMENT_METHODS = ['Online', 'Physical']


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rental = models.ForeignKey(Rental, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(decimal_places=2, max_digits=10)
    payment_status = models.CharField(max_length=50, default='Pending')
    payment_method = models.CharField(
        max_length=50,
        default='Physical',
        choices=[('Online', 'Online'), ('Physical', 'Physical')]
    )
    currency = models.CharField(max_length=10, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking by {self.user.username} for {self.rental.name}"


class BookingError(APIException):
    status_code = 400
    default_detail = 'Invalid booking request'
    default_code = 'invalid_booking'


class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = 'BookingSerializer'
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('rental')

    def validate_booking_dates(self, start_date, end_date):
        if start_date > end_date:
            raise BookingError('End date cannot be before start date.')
        if start_date < date.today():
            raise BookingError('Start date cannot be in the past.')

    def check_rental_availability(self, rental, start_date, end_date):
        # Check if rental is available for the requested dates
        conflicting_bookings = Booking.objects.filter(
            rental=rental,
            start_date__lte=end_date,
            end_date__gte=start_date
        ).exists()
        
        if conflicting_bookings or not rental.is_available:
            raise BookingError(
                f"The rental '{rental.name}' is not available for the selected dates."
            )

    def create(self, request, *args, **kwargs):
        try:
            data = request.data
            print("Incoming booking data:", data)

            required_fields = ['rental', 'start_date', 'end_date', 'total_price', 'payment_method']
            missing = [f for f in required_fields if f not in data]
            if missing:
                raise BookingError(f"Missing fields: {', '.join(missing)}")

            rental = Rental.objects.get(id=data['rental'])
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            
            self.validate_booking_dates(start_date, end_date)
            self.check_rental_availability(rental, start_date, end_date)

            total_price = float(data['total_price'])
            if total_price <= 0:
                raise BookingError("Total price must be greater than zero.")

            if data['payment_method'] not in VALID_PAYMENT_METHODS:
                raise BookingError(f"Invalid payment method. Use: {', '.join(VALID_PAYMENT_METHODS)}")

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            booking = serializer.save(user=request.user, rental=rental)

            # Mark the rental as unavailable
            rental.is_available = False
            rental.save()

            # Create notification for the user
            Notification.objects.create(
                user=request.user,
                message=f"Your booking for {rental.name} from {start_date} to {end_date} has been confirmed. Total price: ${total_price}.",
                data={
                    "booking_id": booking.id,
                    "rental_id": rental.id,
                    "start_date": data['start_date'],
                    "end_date": data['end_date'],
                    "total_price": data['total_price']
                }
            )

            booking_data = serializer.data

            if data['payment_method'] == 'Online':
                payment_data = {
                    'tx_ref': str(uuid.uuid4()),
                    'amount': float(booking_data['total_price']),
                    'currency': 'USD',
                    'payment_options': 'card,banktransfer,mobilemoney',
                    'redirect_url': 'http://localhost:3000/success',
                    'customer': {
                        'email': request.user.email,
                        'phonenumber': getattr(request.user, 'phone_number', ''),
                        'name': request.user.get_full_name() or request.user.username,
                    },
                    'customizations': {
                        'title': 'Rental Booking',
                        'description': f'Payment for rental #{booking_data["id"]}',
                        'logo': 'https://your-logo-url.com/logo.png',
                    }
                }
                print("Payment data:", payment_data)
                return Response(payment_data, status=status.HTTP_201_CREATED)

            return Response(booking_data, status=status.HTTP_201_CREATED)

        except Rental.DoesNotExist:
            return Response({'error': 'Rental not found'}, status=status.HTTP_404_NOT_FOUND)
        except BookingError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Unexpected error:", e)
            return Response({'error': 'Unexpected error', 'details': str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = 'BookingSerializer'
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            booking_id = request.data.get('booking_id')
            if not booking_id:
                return Response({'error': 'Booking ID required.'}, status=status.HTTP_400_BAD_REQUEST)

            booking = Booking.objects.filter(id=booking_id, user=request.user).first()
            if not booking:
                return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

            if now() - booking.created_at > timedelta(hours=24):
                return Response({'error': 'Only bookings within 24 hours can be canceled.'},
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Get the rental before deleting the booking
            rental = booking.rental
            
            # Delete the booking
            booking.delete()
            
            # Make the rental available again
            rental.is_available = True
            rental.save()
            
            # Create notification about cancellation
            Notification.objects.create(
                user=request.user,
                message=f"Your booking for {rental.name} has been successfully canceled.",
                data={
                    "rental_id": rental.id,
                    "action": "cancellation"
                }
            )
            
            return Response({'message': 'Booking canceled successfully.'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompleteBookingView(APIView):
    """API endpoint to mark a booking as completed and return rental to inventory"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            booking_id = request.data.get('booking_id')
            if not booking_id:
                return Response({'error': 'Booking ID required.'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Allow admin or booking owner to complete
            booking = None
            if request.user.is_staff:
                booking = Booking.objects.filter(id=booking_id).first()
            else:
                booking = Booking.objects.filter(id=booking_id, user=request.user).first()
                
            if not booking:
                return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)
                
            # Get rental reference
            rental = booking.rental
            
            # Mark booking as complete (you might want to keep it for records)
            booking.payment_status = 'Completed'
            booking.save()
            
            # Make rental available again
            rental.is_available = True
            rental.save()
            
            # Create notification
            Notification.objects.create(
                user=booking.user,
                message=f"Your booking for {rental.name} has been completed. Thank you for using our service!",
                data={
                    "booking_id": booking.id,
                    "rental_id": rental.id,
                    "action": "completed"
                }
            )
            
            return Response({'message': 'Booking completed successfully.'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
