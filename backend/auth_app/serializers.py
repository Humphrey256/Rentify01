from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'role': {'required': True}
        }
    
    def validate(self, data):
        # Check for username and email uniqueness
        username = data.get('username')
        email = data.get('email')
        
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "This username is already taken"})
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "This email address is already registered"})
        
        # Validate password
        try:
            password = data.get('password')
            validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
            
        return data
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'user')
        )
        
        if 'first_name' in validated_data:
            user.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            user.last_name = validated_data['last_name']
        
        user.save()
        return user
