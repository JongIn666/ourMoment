from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.group import Group
from ..models.post import Post
from ..serializers.post import PostSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def group_posts(request, group_id):
    group = get_object_or_404(
        Group.objects.filter(groupmember__user=request.user),
        pk=group_id,
    )

    if request.method == 'POST':
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user, group=group)
        return Response(PostSerializer(post).data, status=status.HTTP_201_CREATED)

    posts = (
        Post.objects.filter(group=group)
        .select_related('author', 'author__profile')
        .order_by('-createdAt')
    )
    return Response(PostSerializer(posts, many=True).data)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def post_detail(request, post_id):
    post = get_object_or_404(
        Post.objects.filter(group__groupmember__user=request.user),
        pk=post_id,
    )
    if post.author_id != request.user.id:
        raise PermissionDenied('You can only edit or delete your own posts.')

    if request.method == 'PATCH':
        provided_fields = set(request.data.keys())
        if provided_fields != {'content', 'createdAt'}:
            raise ValidationError({'content': 'Provide the post content and timestamp to edit.'})
        serializer = PostSerializer(post, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_post = serializer.save(editedAt=timezone.now())
        return Response(PostSerializer(updated_post).data)

    post.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
