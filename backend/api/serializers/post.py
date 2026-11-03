import uuid

from django.contrib.auth import get_user_model
from django.core.validators import URLValidator
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
    displayName = serializers.SerializerMethodField()
    profilePicUrl = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'displayName', 'profilePicUrl']

    def get_displayName(self, user):
        try:
            return user.profile.displayName
        except Profile.DoesNotExist:
            return ''

    def get_profilePicUrl(self, user):
        try:
            return user.profile.profilePicUrl
        except Profile.DoesNotExist:
            return ''


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    createdAt = serializers.DateTimeField(required=False)
    content = serializers.CharField(max_length=100, required=False, allow_blank=True)
    link = serializers.URLField(
        max_length=2048, required=False, allow_blank=True,
        validators=[URLValidator(schemes=['http', 'https'])],
    )
    media = MediaSerializer(many=True, read_only=True)
    uploads = serializers.ListField(child=serializers.FileField(), required=False, write_only=True)
    removedMedia = serializers.ListField(
        child=serializers.IntegerField(min_value=1), required=False, write_only=True,
    )

    class Meta:
        model = Post
        fields = ['id', 'author', 'group', 'createdAt', 'content', 'link', 'editedAt', 'media', 'uploads', 'removedMedia']
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
        link = attrs.get('link', self.instance.link if self.instance else '')
        removed = set(attrs.get('removedMedia', []))
        if removed and (
            self.instance is None or self.instance.media.filter(pk__in=removed).count() != len(removed)
        ):
            raise serializers.ValidationError({'removedMedia': 'Choose media that belongs to this post.'})
        has_media = self.instance is not None and self.instance.media.exclude(pk__in=removed).exists()
        if not content and not link and not attrs.get('uploads') and not has_media:
            raise serializers.ValidationError({'content': 'Write a moment or add media or a link.'})
        return attrs

    def create(self, validated_data):
        return self.save_post(validated_data)

    def update(self, instance, validated_data):
        return self.save_post(validated_data, instance)

    def save_post(self, validated_data, instance=None):
        uploads = validated_data.pop('uploads', [])
        removed = validated_data.pop('removedMedia', [])
        saved_files = []
        try:
            with transaction.atomic():
                post = super().create(validated_data) if instance is None else super().update(instance, validated_data)
                for upload in uploads:
                    extension = MEDIA_TYPES[upload.content_type]
                    key = f'post-media/{post.author_id}/{uuid.uuid4().hex}.{extension}'
                    saved_key = save_media_file(upload, key)
                    saved_files.append(saved_key)
                    Media.objects.create(post=post, file=saved_key, type=upload.content_type.split('/')[0])
                if removed:
                    post.media.filter(pk__in=removed).delete()
                if getattr(post, '_prefetched_objects_cache', None):
                    post._prefetched_objects_cache = {}
                return post
        except Exception:
            for key in saved_files:
                delete_media_file(key)
            raise
