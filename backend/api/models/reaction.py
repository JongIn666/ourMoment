from django.conf import settings
from django.db import models


class Reaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='postReactions',
    )
    post = models.ForeignKey(
        'api.Post',
        on_delete=models.CASCADE,
        related_name='reactions',
    )
    emoji = models.CharField(max_length=16)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reaction'
        constraints = [
            models.UniqueConstraint(fields=['user', 'post', 'emoji'], name='unique_user_post_emoji_reaction'),
        ]
        ordering = ['createdAt', 'id']

    def __str__(self):
        return f'{self.user.username} reacted {self.emoji} to post {self.post_id}'