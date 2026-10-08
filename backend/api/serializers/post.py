from django.contrib.auth import get_user_model
from rest_framework import serializers

from ..models.post import Post
from ..models.profile import Profile

User = get_user_model()


class PostAuthorSerializer(serializers.ModelSerializer):
    profilePicUrl = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'profilePicUrl']

    def get_profilePicUrl(self, user):
        try:
            return user.profile.profilePicUrl
        except Profile.DoesNotExist:
            return ''


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    createdAt = serializers.DateTimeField(required=False)

    class Meta:
        model = Post
        fields = ['id', 'author', 'group', 'createdAt', 'content', 'editedAt']
        read_only_fields = ['id', 'author', 'group', 'editedAt']
