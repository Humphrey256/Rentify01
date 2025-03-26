from rest_framework import generics
from .models import Rental
from .serializers import RentalSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
import logging

logger = logging.getLogger(__name__)

class RentalListView(generics.ListCreateAPIView):
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        try:
            serializer.save()
            logger.debug('Product added successfully')  # Log successful product addition
        except Exception as e:
            logger.error(f'Failed to add product: {str(e)}')  # Log error during product addition
            raise

class RentalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        try:
            serializer.save()
            logger.debug('Product updated successfully')  # Log successful product update
        except Exception as e:
            logger.error(f'Failed to update product: {str(e)}')  # Log error during product update
            raise

    def perform_destroy(self, instance):
        try:
            instance.delete()
            logger.debug('Product deleted successfully')  # Log successful product deletion
        except Exception as e:
            logger.error(f'Failed to delete product: {str(e)}')  # Log error during product deletion
            raise
