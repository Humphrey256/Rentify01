from rest_framework import serializers
from .models import Rental

class RentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rental
        fields = '__all__'  # Ensure all fields, including the image field, are included
