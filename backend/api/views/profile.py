from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.profile import Profile
from ..serializers import ProfileSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user_profile, _ = Profile.objects.get_or_create(user=request.user)
    return Response(ProfileSerializer(user_profile).data)