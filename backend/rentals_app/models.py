from django.db import models

class Rental(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    details = models.TextField()
    price = models.DecimalField(decimal_places=2, max_digits=10)
    available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='rentals/')  # Ensure the image is uploaded to the 'rentals/' directory