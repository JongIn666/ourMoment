import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from ..models.profile import Profile
from ..serializers.auth import (
    ChangeEmailSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordIdentifierSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)

User = get_user_model()

GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'


def auth_response(user, response_status=status.HTTP_200_OK):
    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {
            'token': token.key,
            'user': UserSerializer(user).data,
        },
        status=response_status,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return auth_response(user, status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return auth_response(serializer.validated_data['user'])


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({'detail': 'Password updated.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_check(request):
    serializer = ResetPasswordIdentifierSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return Response({'detail': 'Account found.'}, status=status.HTTP_200_OK)


def verify_google_id_token(id_token):
    try:
        with urlopen(f'{GOOGLE_TOKENINFO_URL}?{urlencode({"id_token": id_token})}', timeout=10) as response:
            payload = json.loads(response.read().decode())
    except (URLError, ValueError, OSError):
        raise ValidationError('Could not verify your Google account. Please try again.')

    if settings.GOOGLE_CLIENT_IDS and payload.get('aud') not in settings.GOOGLE_CLIENT_IDS:
        raise ValidationError('That Google sign-in was not meant for this app.')
    if payload.get('email_verified') not in (True, 'true'):
        raise ValidationError('Your Google email address is not verified.')
    if not payload.get('email'):
        raise ValidationError('Google did not share an email address with us.')

    return payload


def parse_google_error(error):
    try:
        body = json.loads(error.read().decode())
    except (ValueError, OSError):
        return 'Could not exchange your Google sign-in. Please try again.'

    description = body.get('error_description') or body.get('error')
    if description:
        return f'Google could not complete sign-in: {description}'
    return 'Could not exchange your Google sign-in. Please try again.'


def exchange_google_auth_code(code, code_verifier, redirect_uri, client_id):
    if not code:
        raise ValidationError('No Google authorization code was provided.')
    if not code_verifier:
        raise ValidationError('No Google code verifier was provided.')
    if not redirect_uri:
        raise ValidationError('No Google redirect URI was provided.')
    if not client_id:
        raise ValidationError('No Google client ID was provided.')
    if settings.GOOGLE_CLIENT_IDS and client_id not in settings.GOOGLE_CLIENT_IDS:
        raise ValidationError('That Google sign-in was not meant for this app.')

    body = urlencode({
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': client_id,
        'code_verifier': code_verifier,
        'redirect_uri': redirect_uri,
    }).encode()
    request = Request(
        GOOGLE_TOKEN_URL,
        data=body,
        headers={
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method='POST',
    )

    try:
        with urlopen(request, timeout=10) as response:
            token_payload = json.loads(response.read().decode())
    except HTTPError as error:
        raise ValidationError(parse_google_error(error))
    except (URLError, ValueError, OSError):
        raise ValidationError('Could not exchange your Google sign-in. Please try again.')

    id_token = token_payload.get('id_token')
    if not id_token:
        raise ValidationError('Google did not return an ID token. Please try again.')
    return id_token


def display_name_from_google(name, fallback):
    cleaned = ''.join(
        character for character in name
        if character.isascii() and (character.isalnum() or character == ' ')
    ).strip()
    return cleaned[:30] or fallback


def unique_username_from_email(email):
    base = ''.join(character for character in email.split('@')[0] if character.isascii() and character.isalnum())
    base = (base or 'user')[:20]
    username = base
    suffix = 1
    while User.objects.filter(username__iexact=username).exists():
        suffix += 1
        username = f'{base[:20 - len(str(suffix))]}{suffix}'
    return username


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    id_token = request.data.get('idToken')
    if not id_token:
        id_token = exchange_google_auth_code(
            request.data.get('code'),
            request.data.get('codeVerifier'),
            request.data.get('redirectUri'),
            request.data.get('clientId'),
        )

    payload = verify_google_id_token(id_token)
    email = payload['email']

    user = User.objects.filter(email__iexact=email).first()
    if user is None:
        with transaction.atomic():
            user = User.objects.create_user(
                username=unique_username_from_email(email),
                email=email,
            )
            user.set_unusable_password()
            user.save(update_fields=['password'])
            picture = payload.get('picture', '')
            Profile.objects.create(
                user=user,
                displayName=display_name_from_google(payload.get('name', ''), user.get_username()),
                profilePicUrl=picture if len(picture) <= 200 else '',
            )

    if not user.is_active:
        raise ValidationError('This account is inactive.')

    return auth_response(user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


class ChangeEmailView(GenericAPIView):
    serializer_class = ChangeEmailSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'email': request.user.email})

    def patch(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_email = serializer.validated_data['email']

        with transaction.atomic():
            request.user.email = new_email
            request.user.save(update_fields=['email'])
            sent_count = send_mail(
                subject='Welcome to ourMoment',
                message='Your account email has been updated. Welcome to ourMoment!',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[new_email],
                fail_silently=False,
            )
            if sent_count != 1:
                raise APIException('The welcome email could not be sent.')

        return Response({'email': request.user.email}, status=status.HTTP_200_OK)

    def put(self, request):
        return self.patch(request)


change_email = ChangeEmailView.as_view()
