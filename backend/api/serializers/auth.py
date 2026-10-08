from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers

from ..models.profile import Profile
from .profile import ProfileSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

    def get_profile(self, user):
        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={'displayName': user.get_username()},
        )
        return ProfileSerializer(profile).data


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    confirmPassword = serializers.CharField(write_only=True, min_length=8)
    displayName = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('That username is already taken.')
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('That email is already registered.')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError('Passwords do not match.')
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmPassword')
        display_name = validated_data.pop('displayName', '')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(
            user=user,
            displayName=display_name or user.get_username(),
        )
        return user


class ChangeEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(initial='new@example.com')

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError('That email is already registered.')
        return value


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs['identifier']
        password = attrs['password']
        username = identifier

        if '@' in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
            if user is not None:
                username = user.get_username()

        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid username/email or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account is inactive.')

        attrs['user'] = user
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirmPassword = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        identifier = attrs['identifier']
        user = User.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier)
        ).first()

        if user is None:
            raise serializers.ValidationError('No account found with that username or email.')
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError('Passwords do not match.')

        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        user.set_password(self.validated_data['password'])
        user.save(update_fields=['password'])
        return user


class ResetPasswordIdentifierSerializer(serializers.Serializer):
    identifier = serializers.CharField()

    def validate_identifier(self, value):
        if not User.objects.filter(Q(username__iexact=value) | Q(email__iexact=value)).exists():
            raise serializers.ValidationError('No account found with that username or email.')
        return value
