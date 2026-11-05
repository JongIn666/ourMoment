from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.group import Group
from ..models.tag import Tag
from ..serializers.tag import TagSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def group_tags(request, group_id):
    group = get_object_or_404(Group.objects.filter(groupmember__user=request.user), pk=group_id)

    if request.method == 'POST':
        serializer = TagSerializer(data=request.data, context={'group': group})
        serializer.is_valid(raise_exception=True)
        tag = serializer.save(group=group)
        return Response(TagSerializer(tag).data, status=status.HTTP_201_CREATED)

    return Response(TagSerializer(group.tags.all(), many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def tag_detail(request, tag_id):
    tag = get_object_or_404(Tag.objects.filter(group__groupmember__user=request.user), pk=tag_id)
    serializer = TagSerializer(tag, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)