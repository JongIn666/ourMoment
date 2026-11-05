from django.db import models
from django.utils import timezone

class Tag(models.Model):
    group = models.ForeignKey('api.Group', on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=30)
    color = models.CharField(max_length=7, blank=True, default='')
    createdAt = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'tag'
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(fields=['group', 'name'], name='unique_tag_name_per_group')
        ]

    def __str__(self):
        return f'#{self.name} in {self.group.name}'

class PostTag(models.Model):
    post = models.ForeignKey('api.Post', on_delete=models.CASCADE, related_name='post_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='post_tags')

    class Meta:
        db_table = 'post_tag'
        ordering = ['id']
        constraints = [
            models.UniqueConstraint(fields=['post', 'tag'], name='unique_post_tag'),
        ]