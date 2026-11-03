from django.conf import settings
from django.urls import reverse
from rest_framework import serializers

from ..models.media import Media
from ..storage import get_s3_client


class MediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = ['id', 'type', 'url']

    def get_url(self, media):
        if settings.AWS_S3_BUCKET:
            return get_s3_client().generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.AWS_S3_BUCKET, 'Key': media.file},
                ExpiresIn=3600,
            )
        url = reverse('media-detail', args=[media.pk])
        return self.context['request'].build_absolute_uri(url)
