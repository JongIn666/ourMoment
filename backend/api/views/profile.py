import base64
import binascii
import logging
import uuid
from urllib.parse import unquote, urlparse

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import parser_classes
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.profile import Profile
from ..serializers import ProfileSerializer

logger = logging.getLogger(__name__)

PROFILE_PICTURE_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
}
PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024


def get_s3_client():
    try:
        import boto3
    except ImportError as error:
        raise APIException('S3 uploads are not installed. Run pip install -r backend/requirements.txt.') from error

    return boto3.client(
        's3',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
    )


def get_s3_key_from_profile_picture_url(profile_picture_url):
    if not settings.AWS_S3_BUCKET or not profile_picture_url:
        return None

    parsed_url = urlparse(profile_picture_url)
    bucket_host_prefix = f'{settings.AWS_S3_BUCKET}.s3.'
    bucket_host = f'{settings.AWS_S3_BUCKET}.s3.amazonaws.com'

    if parsed_url.netloc == bucket_host or parsed_url.netloc.startswith(bucket_host_prefix):
        return unquote(parsed_url.path.lstrip('/')) or None

    path_prefix = f'/{settings.AWS_S3_BUCKET}/'
    if parsed_url.netloc.startswith('s3.') and parsed_url.path.startswith(path_prefix):
        return unquote(parsed_url.path.removeprefix(path_prefix)) or None

    return None


def delete_replaced_profile_picture(profile_picture_url):
    key = get_s3_key_from_profile_picture_url(profile_picture_url)
    if key is None:
        return

    try:
        from botocore.exceptions import BotoCoreError, ClientError
    except ImportError:
        logger.warning('Could not delete replaced profile picture because botocore is not installed.')
        return

    try:
        get_s3_client().delete_object(Bucket=settings.AWS_S3_BUCKET, Key=key)
    except (BotoCoreError, ClientError):
        logger.exception('Could not delete replaced profile picture from S3: %s', key)


def save_profile_picture(image, key):
    if settings.AWS_S3_BUCKET:
        try:
            from botocore.exceptions import BotoCoreError, ClientError
        except ImportError as error:
            raise APIException('S3 uploads are not installed. Run pip install -r backend/requirements.txt.') from error

        client = get_s3_client()
        try:
            client.upload_fileobj(
                image,
                settings.AWS_S3_BUCKET,
                key,
                ExtraArgs={'ContentType': image.content_type},
            )
        except (BotoCoreError, ClientError) as error:
            raise APIException('Unable to upload your picture. Please try again.') from error

        return f'https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}'

    saved_key = default_storage.save(key, image)
    return f'{settings.MEDIA_URL}{saved_key}'


def read_profile_picture(request):
    image = request.FILES.get('image')
    if image is not None:
        extension = PROFILE_PICTURE_TYPES.get(image.content_type)
        if extension is None:
            raise ValidationError({'image': 'Use a JPEG, PNG, WebP, or HEIC image.'})
        if image.size > PROFILE_PICTURE_MAX_BYTES:
            raise ValidationError({'image': 'Image must be 5 MB or smaller.'})
        return image, extension

    encoded_image = request.data.get('base64')
    content_type = request.data.get('type') or 'image/jpeg'
    if not encoded_image:
        raise ValidationError({'image': 'Choose an image to upload.'})
    if isinstance(encoded_image, str) and ',' in encoded_image[:80]:
        encoded_image = encoded_image.split(',', 1)[1]
    if not isinstance(encoded_image, str):
        raise ValidationError({'image': 'Choose an image to upload.'})

    extension = PROFILE_PICTURE_TYPES.get(content_type)
    if extension is None:
        raise ValidationError({'image': 'Use a JPEG, PNG, WebP, or HEIC image.'})

    try:
        decoded_image = base64.b64decode(encoded_image, validate=True)
    except (binascii.Error, ValueError) as error:
        raise ValidationError({'image': 'Choose a valid image to upload.'}) from error

    if len(decoded_image) > PROFILE_PICTURE_MAX_BYTES:
        raise ValidationError({'image': 'Image must be 5 MB or smaller.'})

    image = ContentFile(decoded_image, name=f'profile-picture.{extension}')
    image.content_type = content_type
    return image, extension


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    user_profile, _ = Profile.objects.get_or_create(user=request.user)
    if request.method == 'PATCH':
        serializer = ProfileSerializer(user_profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    return Response(ProfileSerializer(user_profile).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, MultiPartParser])
def profile_picture(request):
    image, extension = read_profile_picture(request)
    if not settings.MEDIA_URL:
        raise APIException('Picture storage is not configured.')

    key = f'profile-pictures/{request.user.pk}/{uuid.uuid4().hex}.{extension}'
    picture_url = save_profile_picture(image, key)

    user_profile, _ = Profile.objects.get_or_create(user=request.user)
    old_profile_pic_url = user_profile.profilePicUrl
    if picture_url.startswith('http'):
        user_profile.profilePicUrl = picture_url
    else:
        user_profile.profilePicUrl = request.build_absolute_uri(picture_url)
    user_profile.save(update_fields=['profilePicUrl'])

    if old_profile_pic_url != user_profile.profilePicUrl:
        delete_replaced_profile_picture(old_profile_pic_url)

    return Response(ProfileSerializer(user_profile).data)
