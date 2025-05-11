from rest_framework import serializers
from .models import Rental

class RentalSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Rental
        fields = ['id', 'name', 'category', 'details', 'price', 'is_available', 'image', 'image_url']

    def get_image_url(self, obj):
        return obj.image_url
