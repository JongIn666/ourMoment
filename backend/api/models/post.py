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
	)
	createdAt = models.DateTimeField(default=timezone.now)
	content = models.TextField()
	editedAt = models.DateTimeField(blank=True, null=True)

	class Meta:
		db_table = 'post'
		ordering = ['-createdAt']

	def __str__(self):
		return f'Post by {self.author.username} in {self.group.name}'
