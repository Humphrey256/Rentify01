
from rest_framework import generics
from .models import Issue
from .serializers import IssueSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class IssueListCreateView(generics.ListCreateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAdminUser]
