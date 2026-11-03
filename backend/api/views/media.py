from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models import Q
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models.media import Media
from ..serializers.media import MediaSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def media_detail(request, media_id):
    media = get_object_or_404(
        Media.objects.filter(
            Q(post__author=request.user, post__group__isnull=True)
            | Q(post__group__groupmember__user=request.user)
        ),
        pk=media_id,
    )
    if settings.AWS_S3_BUCKET:
        return redirect(MediaSerializer(media).data['url'])
    try:
        return FileResponse(default_storage.open(media.file, 'rb'))
    except FileNotFoundError as error:
        raise Http404 from error
