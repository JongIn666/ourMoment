from django.conf import settings
from django.db import models
from django.utils import timezone


class Post(models.Model):
	author = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='posts',
	)
	group = models.ForeignKey(
		'api.Group',
		on_delete=models.CASCADE,
		related_name='posts',
		blank=True,
		null=True,
	)
	createdAt = models.DateTimeField(default=timezone.now)
	content = models.TextField()
	link = models.URLField(max_length=2048, blank=True)
	reactionCounts = models.JSONField(default=dict, blank=True)
	editedAt = models.DateTimeField(blank=True, null=True)

	class Meta:
		db_table = 'post'
		ordering = ['-createdAt', '-id']

	def __str__(self):
		if self.group_id is None:
			return f'Post by {self.author.username}'
		return f'Post by {self.author.username} in {self.group.name}'
