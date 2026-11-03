from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from ..models.profile import Profile
from ..storage import delete_replaced_profile_picture

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', max_length=20)
    email = serializers.EmailField(source='user.email', read_only=True)
    bio = serializers.CharField(max_length=200, allow_blank=True)

    class Meta:
        model = Profile
        fields = [
            'username',
            'email',
            'displayName',
            'birthday',
            'showAge',
            'showBirthday',
            'profilePicUrl',
            'bio',
        ]

    def validate_username(self, value):
        if not value.isascii() or not value.isalnum():
            raise serializers.ValidationError('Username can contain only letters and numbers.')
        users = User.objects.filter(username__iexact=value)
        if self.instance is not None:
            users = users.exclude(pk=self.instance.user_id)
        if users.exists():
            raise serializers.ValidationError('That username is already taken.')
        return value

    def validate_displayName(self, value):
        if value and not all(
            character.isascii() and (character.isalnum() or character == ' ')
            for character in value
        ):
            raise serializers.ValidationError(
                'Display name can contain only letters, numbers, and spaces.'
            )
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        username = user_data.get('username')
        with transaction.atomic():
            instance = Profile.objects.select_for_update().get(pk=instance.pk)
            old_picture_url = instance.profilePicUrl
            profile = super().update(instance, validated_data)
            if username is not None:
                profile.user.username = username
                profile.user.save(update_fields=['username'])
            if old_picture_url != profile.profilePicUrl:
                transaction.on_commit(lambda: delete_replaced_profile_picture(old_picture_url, profile.user_id))
        return profile


