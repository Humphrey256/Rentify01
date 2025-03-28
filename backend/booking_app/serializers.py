from rest_framework import serializers
from .models import Booking
from rentals_app.serializers import RentalSerializer  # Import RentalSerializer

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')  # Make user field read-only
    rental = RentalSerializer(read_only=True)  # Include rental details

    class Meta:
        model = Booking
        fields = '__all__'
