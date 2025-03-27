from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Booking
from .serializers import BookingSerializer
import datetime
import uuid
from django.core.exceptions import ValidationError
from rest_framework.exceptions import APIException
from rest_framework.views import APIView

class BookingError(APIException):
    status_code = 400
    default_detail = 'Invalid booking request'
    default_code = 'invalid_booking'

class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def validate_booking_dates(self, start_date, end_date):
        if start_date > end_date:
            raise BookingError('End date cannot be before start date')
        
        if start_date < datetime.date.today():
            raise BookingError('Cannot book with a past start date')
        
        # Allow single-day bookings
        if start_date == end_date:
            print("Single-day booking allowed.")

    def perform_create(self, serializer):
        # Ensure the user field is set explicitly
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            # Log the incoming request data for debugging
            print("Incoming request data:", request.data)

            # Validate required fields
            required_fields = ['rental', 'start_date', 'end_date', 'total_price', 'payment_method']
            missing_fields = [field for field in required_fields if field not in request.data]
            
            if missing_fields:
                raise BookingError(f"Missing required fields: {', '.join(missing_fields)}")

            # Validate dates
            try:
                start_date = datetime.datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
                end_date = datetime.datetime.strptime(request.data['end_date'], '%Y-%m-%d').date()
                self.validate_booking_dates(start_date, end_date)
            except ValueError as e:
                raise BookingError(f'Invalid date format. Use YYYY-MM-DD. Error: {str(e)}')

            # Validate total price
            try:
                total_price = float(request.data['total_price'])
                if total_price <= 0:
                    raise BookingError('Total price must be greater than 0')
            except ValueError as e:
                raise BookingError(f'Invalid total price. Error: {str(e)}')

            # Validate payment method
            valid_payment_methods = ['Online', 'Physical']
            if request.data['payment_method'] not in valid_payment_methods:
                raise BookingError('Invalid payment method. Use "Online" or "Physical"')

            # Create serializer with validated data
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                print("Serializer validation errors:", serializer.errors)  # Log detailed errors
                return Response(
                    {'error': serializer.errors, 'details': 'Validation failed'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            self.perform_create(serializer)
            booking = serializer.data

            # Handle online payment
            if request.data['payment_method'] == 'Online':
                try:
                    payment_data = {
                        'tx_ref': str(uuid.uuid4()),
                        'amount': float(booking['total_price']),
                        'currency': 'USD',
                        'payment_options': 'card,banktransfer,mobilemoney',  # Include all desired payment methods
                        'redirect_url': 'http://localhost:3000/success',
                        'customer': {
                            'email': request.user.email,
                            'phonenumber': getattr(request.user, 'phone_number', ''),
                            'name': request.user.get_full_name() or request.user.username,
                        },
                        'customizations': {
                            'title': 'Rental Booking',
                            'description': f'Payment for rental booking #{booking["id"]}',
                            'logo': 'https://your-logo-url.com/logo.png',
                        }
                    }
                    print("Generated payment data:", payment_data)  # Log payment data for debugging
                    return Response(payment_data, status=status.HTTP_201_CREATED)
                except Exception as e:
                    # Rollback booking if payment setup fails
                    Booking.objects.filter(id=booking['id']).delete()
                    raise BookingError(f'Payment setup failed: {str(e)}')
            
            return Response(booking, status=status.HTTP_201_CREATED)

        except BookingError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")  # Log unexpected errors
            return Response(
                {'error': 'An unexpected error occurred', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

class ActiveBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user,
            end_date__gte=datetime.date.today()
        ).order_by('start_date')

class RentalHistoryView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user,
            end_date__lt=datetime.date.today()
        ).order_by('-end_date')

class ConfirmPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            tx_ref = request.data.get('tx_ref')
            if not tx_ref:
                raise BookingError("Transaction reference is required.")

            # Find the booking associated with the transaction reference
            booking = Booking.objects.filter(payment_status='Pending', user=request.user).first()
            if not booking:
                raise BookingError("No pending booking found for this transaction.")

            # Simulate payment verification (replace with actual payment gateway verification)
            payment_verified = True  # Replace with actual verification logic
            if not payment_verified:
                raise BookingError("Payment verification failed.")

            # Update payment status
            booking.payment_status = 'Completed'
            booking.save()

            return Response({'message': 'Payment confirmed and booking completed.'}, status=status.HTTP_200_OK)
        except BookingError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
