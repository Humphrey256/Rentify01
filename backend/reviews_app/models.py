from django.db import models
from auth_app.models import User
from rentals_app.models import Rental

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rental = models.ForeignKey(Rental, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
