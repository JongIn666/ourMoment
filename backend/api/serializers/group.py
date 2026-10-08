from rest_framework import serializers

from django.contrib.auth import get_user_model
from ..models.group import Group
from ..models.profile import Profile

User = get_user_model()


class GroupMemberSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile']

    def get_profile(self, user):
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            return {
                'displayName': '',
                'profilePicUrl': '',
                'bio': '',
                'birthday': None,
                'showAge': False,
                'showBirthday': False,
            }

        return {
            'displayName': profile.displayName,
            'profilePicUrl': profile.profilePicUrl,
            'bio': profile.bio,
            'birthday': profile.birthday,
            'showAge': profile.showAge,
            'showBirthday': profile.showBirthday,
        }

class GroupSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(many=True, read_only=True)
    description = serializers.CharField(max_length=200, allow_blank=True, required=False)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'members', 'createdAt']

    def validate_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError('Group name is required.')
        if not name.isascii() or not all(character.isalnum() or character == ' ' for character in name):
            raise serializers.ValidationError(
                'Group name can contain only letters, numbers, and spaces.'
            )
        return name
