from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')  # Make user field read-only

    class Meta:
        model = Booking
        fields = '__all__'
