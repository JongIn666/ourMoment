import logging
from urllib.parse import unquote, urlparse

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.exceptions import APIException

logger = logging.getLogger(__name__)


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


def save_media_file(upload, key):
    if not settings.AWS_S3_BUCKET:
        return default_storage.save(key, upload)

    try:
        get_s3_client().upload_fileobj(
            upload,
            settings.AWS_S3_BUCKET,
            key,
            ExtraArgs={'ContentType': upload.content_type},
        )
    except Exception as error:
        raise APIException('Could not upload your media. Please try again.') from error
    return key


def delete_media_file(key):
    try:
        if settings.AWS_S3_BUCKET:
            get_s3_client().delete_object(Bucket=settings.AWS_S3_BUCKET, Key=key)
        else:
            default_storage.delete(key)
    except Exception:
        logger.exception('Could not delete media file: %s', key)


def get_s3_key_from_profile_picture_url(profile_picture_url, user_id):
    if not settings.AWS_S3_BUCKET or not profile_picture_url:
        return None

    try:
        parsed_url = urlparse(profile_picture_url)
    except ValueError:
        return None

    bucket = settings.AWS_S3_BUCKET
    hosts = {'s3.amazonaws.com', f's3.{settings.AWS_REGION}.amazonaws.com'}
    if parsed_url.hostname in {f'{bucket}.{host}' for host in hosts}:
        key = unquote(parsed_url.path.lstrip('/'))
    elif parsed_url.hostname in hosts and parsed_url.path.startswith(f'/{bucket}/'):
        key = unquote(parsed_url.path.removeprefix(f'/{bucket}/'))
    else:
        return None

    if key.startswith(f'profile-pictures/{user_id}/') and '..' not in key.split('/'):
        return key
    return None


def delete_replaced_profile_picture(profile_picture_url, user_id):
    key = get_s3_key_from_profile_picture_url(profile_picture_url, user_id)
    if key:
        delete_media_file(key)
