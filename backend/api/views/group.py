from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.group import Group
from ..serializers import GroupSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group(request):
    user_groups = Group.objects.filter(groupmember__user=request.user).order_by('name')
    return Response(GroupSerializer(user_groups, many=True).data)