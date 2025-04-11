from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.utils.timezone import now
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta, date
from decimal import Decimal
import uuid

from .models import Booking
from .serializers import BookingSerializer
from rentals_app.models import Rental
from notifications_app.models import Notification  # Import Notification model

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
        if start_date < date.today():
            raise BookingError('Cannot book with a past start date')

    def perform_create(self, serializer):
        # Save the booking instance
        booking = serializer.save(user=self.request.user)
        print(f"Booking created: {booking}")  # Debugging log

        # Create a notification for the user
        try:
            from notifications_app.models import Notification
            
            Notification.objects.create(
                user=booking.user,
                message=f"Your booking for {booking.rental.name} from {booking.start_date} to {booking.end_date} has been confirmed. Total price: ${booking.total_price}.",
                data={
                    "booking_id": booking.id,
                    "rental_id": booking.rental.id,
                    "start_date": str(booking.start_date),
                    "end_date": str(booking.end_date),
                    "total_price": booking.total_price,
                },
            )
            print("Notification created successfully.")  # Debugging log
        except Exception as e:
            print(f"Error creating notification: {str(e)}")  # Debugging log

    def create(self, request, *args, **kwargs):
        try:
            print("Incoming request data:", request.data)

            required_fields = ['rental', 'start_date', 'end_date', 'total_price', 'payment_method']
            missing_fields = [field for field in required_fields if field not in request.data]
            if missing_fields:
                raise BookingError(f"Missing required fields: {', '.join(missing_fields)}")

            try:
                rental = Rental.objects.get(id=request.data['rental'])
                
                # Check if rental is already unavailable
                if not rental.is_available:
                    raise BookingError(f"The rental '{rental.name}' is not available for booking.")
                    
            except Rental.DoesNotExist:
                raise BookingError(f"Rental with ID {request.data['rental']} does not exist.")

            try:
                start_date = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
                end_date = datetime.strptime(request.data['end_date'], '%Y-%m-%d').date()
                self.validate_booking_dates(start_date, end_date)
            except ValueError as e:
                raise BookingError(f'Invalid date format. Use YYYY-MM-DD. Error: {str(e)}')

            try:
                total_price = float(request.data['total_price'])
                if total_price <= 0:
                    raise BookingError('Total price must be greater than 0')
            except ValueError as e:
                raise BookingError(f'Invalid total price. Error: {str(e)}')

            if request.data['payment_method'] not in ['Online', 'Physical']:
                raise BookingError('Invalid payment method. Use "Online" or "Physical"')

            # Pass the rental instance to the serializer
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                print("Serializer validation errors:", serializer.errors)
                return Response({'error': serializer.errors, 'details': 'Validation failed'}, status=status.HTTP_400_BAD_REQUEST)

            # Save booking and get the instance
            booking = serializer.save(user=request.user, rental=rental)

            # Mark the rental as unavailable
            rental.is_available = False
            rental.save()
            print(f"Rental {rental.id} marked as unavailable")

            # Create notification explicitly
            print(f"Creating notification for booking {booking.id}")
            notification = Notification.objects.create(
                user=booking.user,
                message=f"Your booking for {booking.rental.name} from {booking.start_date} to {booking.end_date} has been confirmed. Total price: ${booking.total_price}.",
                data={
                    "booking_id": booking.id,
                    "rental_id": booking.rental.id,
                    "start_date": str(booking.start_date),
                    "end_date": str(booking.end_date),
                    "total_price": float(booking.total_price),  # Convert Decimal to float for JSON serialization
                },
            )
            print(f"Notification created: {notification}")

            booking_data = serializer.data

            if request.data['payment_method'] == 'Online':
                try:
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
                            'description': f'Payment for rental booking #{booking_data["id"]}',
                            'logo': 'https://your-logo-url.com/logo.png',
                        }
                    }
                    print("Generated payment data:", payment_data)
                    return Response(payment_data, status=status.HTTP_201_CREATED)
                except Exception as e:
                    # If payment setup fails, make rental available again
                    rental.is_available = True
                    rental.save()
                    Booking.objects.filter(id=booking_data['id']).delete()
                    raise BookingError(f'Payment setup failed: {str(e)}')

            return Response(booking_data, status=status.HTTP_201_CREATED)

        except BookingError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        try:
            booking = self.get_object()
            start_date = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(request.data['end_date'], '%Y-%m-%d').date()

            if start_date > end_date:
                return Response({'error': 'End date cannot be before start date.'}, status=status.HTTP_400_BAD_REQUEST)
            if start_date < date.today():
                return Response({'error': 'Start date cannot be in the past.'}, status=status.HTTP_400_BAD_REQUEST)

            daily_price = booking.rental.price
            new_total_price = Decimal((end_date - start_date).days + 1) * daily_price

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
            return Booking.objects.filter(user=self.request.user, end_date__gte=date.today()).order_by('start_date')
        except Exception as e:
            print(f"Error fetching active bookings: {str(e)}")
            raise APIException("Failed to fetch active bookings. Please try again later.")

class RentalHistoryView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return Booking.objects.filter(user=self.request.user, end_date__lt=date.today()).order_by('-end_date')
        except Exception as e:
            print(f"Error fetching rental history: {str(e)}")
            raise APIException("Failed to fetch rental history. Please try again later.")

class ConfirmPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            tx_ref = request.data.get('tx_ref')
            if not tx_ref:
                raise BookingError("Transaction reference is required.")

            booking = Booking.objects.filter(payment_status='Pending', user=request.user).first()
            if not booking:
                raise BookingError("No pending booking found for this transaction.")

            payment_verified = True  # Replace with actual verification logic
            if not payment_verified:
                raise BookingError("Payment verification failed.")

            booking.payment_status = 'Completed'
            booking.save()

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
            return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

            booking = Booking.objects.filter(id=booking_id, user=request.user).first()
            if not booking:
                return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

            time_difference = now() - booking.created_at
            if time_difference > timedelta(hours=24):
                return Response({'error': 'You can only cancel bookings within 24 hours of creation.'}, status=status.HTTP_400_BAD_REQUEST)

            # Store rental reference before deleting the booking
            rental = booking.rental
            
            # Delete the booking
            booking.delete()
            
            # Make rental available again
            rental.is_available = True
            rental.save()
            print(f"Rental {rental.id} marked as available after cancellation")
            
            # Create notification for cancellation
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
                return Response({'error': 'Booking ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Allow admin or booking owner to complete
            booking = None
            if request.user.is_staff:
                booking = Booking.objects.filter(id=booking_id).first()
            else:
                booking = Booking.objects.filter(id=booking_id, user=request.user).first()
                
            if not booking:
                return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)
                
            # Mark booking as complete
            booking.payment_status = 'Completed'
            booking.save()
            
            # Make rental available again
            rental = booking.rental
            rental.is_available = True
            rental.save()
            print(f"Rental {rental.id} marked as available after completion")
            
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
            
            return Response({
                'message': 'Booking completed successfully.',
                'booking_id': booking.id
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error completing booking: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
