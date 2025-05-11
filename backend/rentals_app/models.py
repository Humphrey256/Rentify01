from django.db import models

class Rental(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    details = models.TextField()
    price = models.DecimalField(decimal_places=2, max_digits=10)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='rentals/', blank=True, null=True)  # Use ImageField for media

    @property
    def image_url(self):
        if self.image:
            return self.image.url  # This will be /media/rentals/filename.jpg
        return '/static/products/default-placeholder.png'

    def __str__(self):
        return self.name