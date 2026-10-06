from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from ..serializers.auth import (
    ChangeEmailSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


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
