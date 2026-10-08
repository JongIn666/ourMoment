from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models.group import Group, GroupMember
from ..serializers import GroupSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def group(request):
    if request.method == 'POST':
        serializer = GroupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            created_group = serializer.save()
            created_group.members.add(request.user)
        return Response(
            GroupSerializer(created_group).data,
            status=status.HTTP_201_CREATED,
        )

    user_groups = (
        Group.objects.filter(groupmember__user=request.user)
        .prefetch_related('members')
        .order_by('name')
        .distinct()
    )
    return Response(GroupSerializer(user_groups, many=True).data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def group_detail(request, group_id):
    user_group = get_object_or_404(
        Group.objects.filter(groupmember__user=request.user).prefetch_related('members'),
        pk=group_id,
    )
    if request.method == 'PATCH':
        serializer = GroupSerializer(user_group, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    if request.method == 'DELETE':
        user_group.delete()
        return Response(status=204)

    return Response(GroupSerializer(user_group).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def leave_group(request, group_id):
    membership = get_object_or_404(
        GroupMember.objects.filter(user=request.user),
        group_id=group_id,
    )
    membership.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
