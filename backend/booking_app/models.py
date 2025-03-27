from django.db import models
from auth_app.models import User
from rentals_app.models import Rental

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rental = models.ForeignKey(Rental, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(decimal_places=2, max_digits=10)
    payment_status = models.CharField(max_length=50, default='Pending')
    payment_method = models.CharField(
        max_length=50,
        default='Physical',
        choices=[('Online', 'Online'), ('Physical', 'Physical')]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
