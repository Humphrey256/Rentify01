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
from django.core.mail import send_mail
from datetime import timedelta
from django.utils.timezone import now
from decimal import Decimal
from rentals_app.models import Rental  # Import the Rental model

class BookingError(APIException):
    status_code = 400
    default_detail = 'Invalid booking request'
    default_code = 'invalid_booking'

class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('rental')

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

            # Resolve the rental field to a Rental object
            try:
                rental = Rental.objects.get(id=request.data['rental'])
            except Rental.DoesNotExist:
                raise BookingError(f"Rental with ID {request.data['rental']} does not exist.")

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

            # Save the booking with the resolved rental object
            serializer.save(user=self.request.user, rental=rental)

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

    def update(self, request, *args, **kwargs):
        try:
            booking = self.get_object()

            # Validate dates
            start_date = datetime.datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.datetime.strptime(request.data['end_date'], '%Y-%m-%d').date()
            if start_date > end_date:
                return Response({'error': 'End date cannot be before start date.'}, status=status.HTTP_400_BAD_REQUEST)
            if start_date < datetime.date.today():
                return Response({'error': 'Start date cannot be in the past.'}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate the new total price
            daily_price = booking.rental.price
            new_total_price = Decimal((end_date - start_date).days + 1) * daily_price

            # Check if additional payment is required
            if new_total_price > booking.total_price:
                additional_payment = new_total_price - booking.total_price
                booking.payment_status = 'Pending Additional Payment'
                booking.total_price = new_total_price
                booking.save()

                return Response({
                    'message': 'Booking updated. Additional payment required.',
                    'additional_payment': float(additional_payment),
                    'new_total_price': float(new_total_price),
                }, status=status.HTTP_200_OK)

            # Update booking
            serializer = self.get_serializer(booking, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ActiveBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return Booking.objects.filter(
                user=self.request.user,
                end_date__gte=datetime.date.today()
            ).order_by('start_date')
        except Exception as e:
            print(f"Error fetching active bookings: {str(e)}")  # Log the error
            raise APIException("Failed to fetch active bookings. Please try again later.")

class RentalHistoryView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return Booking.objects.filter(
                user=self.request.user,
                end_date__lt=datetime.date.today()
            ).order_by('-end_date')
        except Exception as e:
            print(f"Error fetching rental history: {str(e)}")  # Log the error
            raise APIException("Failed to fetch rental history. Please try again later.")

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

            # Send email notification
            send_mail(
                subject='Booking Confirmation',
                message=f'Your booking #{booking.id} has been confirmed. Thank you for your payment!',
                from_email='noreply@rentify.com',
                recipient_list=[request.user.email],
                fail_silently=False,
            )

            return Response({'message': 'Payment confirmed and booking completed.'}, status=status.HTTP_200_OK)
        except BookingError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PaymentHistoryView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user, payment_status='Completed').order_by('-created_at')

class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            booking_id = request.data.get('booking_id')
            if not booking_id:
                return Response({'error': 'Booking ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the booking
            booking = Booking.objects.filter(id=booking_id, user=request.user).first()
            if not booking:
                return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

            # Check if the booking is within the 24-hour cancellation window
            time_difference = now() - booking.created_at
            if time_difference > timedelta(hours=24):
                return Response({'error': 'You can only cancel bookings within 24 hours of creation.'}, status=status.HTTP_400_BAD_REQUEST)

            # Cancel the booking
            booking.delete()
            return Response({'message': 'Booking canceled successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
