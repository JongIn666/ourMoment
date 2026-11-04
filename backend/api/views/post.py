from django.db import transaction
from django.db.models import Exists, OuterRef, Prefetch, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.group import Group, GroupMember, default_reaction_emojis
from ..models.post import Post
from ..models.reaction import Reaction
from ..serializers.post import PostReactionReadSerializer, PostReactionSerializer, PostSerializer


def current_user_reactions(user):
    return Prefetch(
        'reactions',
        queryset=Reaction.objects.filter(user=user),
        to_attr='current_user_reactions',
    )


def posts_visible_to_user(user):
    group_membership = GroupMember.objects.filter(group_id=OuterRef('group_id'), user=user)
    return Post.objects.annotate(
        current_user_is_group_member=Exists(group_membership),
    ).filter(
        Q(author=user)
        | Q(current_user_is_group_member=True, isDraft=False)
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_posts(request):
    posts = (
        Post.objects.filter(author=request.user)
        .select_related('author', 'author__profile', 'group')
        .prefetch_related('media', current_user_reactions(request.user))
        .order_by('-createdAt')
    )
    return Response(PostSerializer(posts, many=True, context={'request': request}).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def personal_posts(request):
    if request.method == 'POST':
        serializer = PostSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user, group=None)
        return Response(PostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)

    posts = (
        Post.objects.filter(author=request.user, group__isnull=True)
        .select_related('author', 'author__profile')
        .prefetch_related('media', current_user_reactions(request.user))
    )
    return Response(PostSerializer(posts, many=True, context={'request': request}).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def group_posts(request, group_id):
    group = get_object_or_404(
        Group.objects.filter(groupmember__user=request.user),
        pk=group_id,
    )

    if request.method == 'POST':
        serializer = PostSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user, group=group)
        return Response(PostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)

    posts = (
        Post.objects.filter(group=group, isDraft=False)
        .select_related('author', 'author__profile')
        .prefetch_related('media', current_user_reactions(request.user))
        .order_by('-createdAt')
    )
    return Response(PostSerializer(posts, many=True, context={'request': request}).data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def post_detail(request, post_id):
    post = get_object_or_404(
        posts_visible_to_user(request.user)
        .select_related('author', 'author__profile', 'group')
        .prefetch_related(
            'media', current_user_reactions(request.user),
        ),
        pk=post_id,
    )

    if request.method == 'GET':
        return Response(PostSerializer(post, context={'request': request}).data)

    if post.author_id != request.user.id:
        raise PermissionDenied('You can only edit or delete your own posts.')

    if request.method == 'PATCH':
        provided_fields = set(request.data.keys())
        if not provided_fields or not provided_fields <= {'content', 'createdAt', 'link', 'weather', 'isDraft', 'uploads', 'removedMedia'}:
            raise ValidationError({'content': 'Provide post content, timestamp, media, a link, weather, or draft status to edit.'})
        serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated_post = serializer.save(editedAt=timezone.now())
        return Response(PostSerializer(updated_post, context={'request': request}).data)

    post.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def post_reaction(request, post_id):
    if request.method == 'GET':
        post = get_object_or_404(
            posts_visible_to_user(request.user),
            pk=post_id,
        )
        reactions = post.reactions.select_related('user', 'user__profile').all()
        return Response(PostReactionReadSerializer(reactions, many=True).data)

    serializer = PostReactionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    emoji = serializer.validated_data['emoji']

    with transaction.atomic():
        post = get_object_or_404(
            posts_visible_to_user(request.user).select_for_update(of=('self',)),
            pk=post_id,
        )

        if request.method == 'POST':
            allowed_emojis = post.group.reactionEmojis if post.group_id else default_reaction_emojis()
            if emoji not in allowed_emojis:
                raise ValidationError({'emoji': 'Choose an emoji enabled for this post.'})

            _, created = Reaction.objects.get_or_create(user=request.user, post=post, emoji=emoji)
            if created:
                counts = dict(post.reactionCounts or {})
                counts[emoji] = counts.get(emoji, 0) + 1
                post.reactionCounts = counts
                post.save(update_fields=['reactionCounts'])
                response_status = status.HTTP_201_CREATED
            else:
                response_status = status.HTTP_200_OK
        else:
            deleted_count, _ = Reaction.objects.filter(
                user=request.user,
                post=post,
                emoji=emoji,
            ).delete()
            if deleted_count:
                counts = dict(post.reactionCounts or {})
                remaining = counts.get(emoji, 0) - 1
                if remaining > 0:
                    counts[emoji] = remaining
                else:
                    counts.pop(emoji, None)
                post.reactionCounts = counts
                post.save(update_fields=['reactionCounts'])
            response_status = status.HTTP_200_OK

        response_data = PostSerializer(post, context={'request': request}).data

    return Response(response_data, status=response_status)

