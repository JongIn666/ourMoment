from django.conf import settings
from django.db import models

class Group(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='GroupMember',
        related_name='memberGroups',
    )

    class Meta:
        db_table = 'user_group'

    def __str__(self):
        return self.name

class GroupMember(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    joinedAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_member'
        constraints = [
            models.UniqueConstraint(fields=['user', 'group'], name='unique_group_member')
        ]

    def __str__(self):
        return f'{self.user.username} in {self.group.name}'
    
