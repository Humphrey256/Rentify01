from django.db import models

class Rental(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    details = models.TextField()
    price = models.DecimalField(decimal_places=2, max_digits=10)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='rentals/', blank=True, null=True)

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return '/static/products/default-placeholder.png'

    def __str__(self):
        return self.name