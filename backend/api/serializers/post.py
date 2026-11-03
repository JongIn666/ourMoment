import uuid

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from ..models.media import Media
from ..models.post import Post
from ..models.profile import Profile
from ..storage import delete_media_file, save_media_file
from .media import MediaSerializer

User = get_user_model()

MEDIA_MAX_BYTES = 8 * 1024 * 1024
MEDIA_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/avif': 'avif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'video/x-m4v': 'm4v',
    'video/3gpp': '3gp',
}


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
    content = serializers.CharField(required=False, allow_blank=True)
    media = MediaSerializer(many=True, read_only=True)
    uploads = serializers.ListField(child=serializers.FileField(), required=False, write_only=True)

    class Meta:
        model = Post
        fields = ['id', 'author', 'group', 'createdAt', 'content', 'editedAt', 'media', 'uploads']
        read_only_fields = ['id', 'author', 'group', 'editedAt']

    def validate_uploads(self, uploads):
        for upload in uploads:
            if upload.size > MEDIA_MAX_BYTES:
                raise serializers.ValidationError('Each image or video must be 8 MB or smaller.')
            if upload.content_type not in MEDIA_TYPES:
                raise serializers.ValidationError('Choose a supported image or video.')
        return uploads

    def validate(self, attrs):
        content = attrs.get('content', self.instance.content if self.instance else '')
        has_media = self.instance is not None and self.instance.media.exists()
        if not content and not attrs.get('uploads') and not has_media:
            raise serializers.ValidationError({'content': 'Write a moment or add an image or video.'})
        return attrs

    def create(self, validated_data):
        uploads = validated_data.pop('uploads', [])
        saved_files = []
        try:
            with transaction.atomic():
                post = super().create(validated_data)
                for upload in uploads:
                    extension = MEDIA_TYPES[upload.content_type]
                    key = f'post-media/{post.author_id}/{uuid.uuid4().hex}.{extension}'
                    saved_key = save_media_file(upload, key)
                    saved_files.append(saved_key)
                    Media.objects.create(post=post, file=saved_key, type=upload.content_type.split('/')[0])
                return post
        except Exception:
            for key in saved_files:
                delete_media_file(key)
            raise
