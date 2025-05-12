from rest_framework import serializers
from .models import Rental

class RentalSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Rental
        fields = ['id', 'name', 'category', 'details', 'price', 'is_available', 'image', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            # Get the base file name
            filename = str(obj.image)
            
            # Make sure URL starts with /media/
            if not obj.image.url.startswith('/media/'):
                return f'/media/{filename}'
            
            # Return the full URL with /media/ prefix
            return obj.image.url
        
        return '/media/default-placeholder.png'
