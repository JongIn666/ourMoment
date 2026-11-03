from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models.group import Group, GroupMember
from ..models.post import Post
from ..models.reaction import Reaction
from ..serializers import GroupSerializer
from ..serializers.group import GroupReactionEmojisSerializer, JoinGroupSerializer

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_group(request):
    serializer = JoinGroupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user_group = Group.objects.filter(inviteCode=serializer.validated_data['inviteCode']).first()
    if user_group is None:
        raise ValidationError({'inviteCode': 'Invalid invite code.'})
    GroupMember.objects.get_or_create(user=request.user, group=user_group)
    return Response(GroupSerializer(user_group).data)


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


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def group_reaction_emojis(request, group_id):
    user_group = get_object_or_404(
        Group.objects.filter(groupmember__user=request.user),
        pk=group_id,
    )

    if request.method == 'PATCH':
        serializer = GroupReactionEmojisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reaction_emojis = serializer.validated_data['reactionEmojis']
        removed_emojis = set(user_group.reactionEmojis) - set(reaction_emojis)

        with transaction.atomic():
            user_group.reactionEmojis = reaction_emojis
            user_group.save(update_fields=['reactionEmojis'])

            if removed_emojis:
                Reaction.objects.filter(
                    post__group=user_group,
                    emoji__in=removed_emojis,
                ).delete()

                for post in Post.objects.filter(group=user_group).only('id', 'reactionCounts'):
                    counts = dict(post.reactionCounts or {})
                    changed = False
                    for emoji in removed_emojis:
                        if emoji in counts:
                            del counts[emoji]
                            changed = True
                    if changed:
                        post.reactionCounts = counts
                        post.save(update_fields=['reactionCounts'])

    return Response({'reactionEmojis': user_group.reactionEmojis})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def leave_group(request, group_id):
    membership = get_object_or_404(
        GroupMember.objects.filter(user=request.user),
        group_id=group_id,
    )
    membership.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
