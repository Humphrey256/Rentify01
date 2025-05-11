from django.db import models

class Rental(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    details = models.TextField()
    price = models.DecimalField(decimal_places=2, max_digits=10)
    is_available = models.BooleanField(default=True)  # Renamed 'available' to 'is_available' for consistency
    image = models.ImageField(upload_to='rentals/')  # Ensure the image is uploaded to the 'rentals/' directory

    # Add this new property method
    @property
    def image_url(self):
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return f'/static/{self.image}'
    
    def __str__(self):
        return self.name