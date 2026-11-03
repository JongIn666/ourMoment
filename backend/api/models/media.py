from django.db import models, transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver

from ..storage import delete_media_file


class Media(models.Model):
    post = models.ForeignKey('api.Post', on_delete=models.CASCADE, related_name='media')
    file = models.CharField(max_length=500)
    type = models.CharField(max_length=5, choices=[('image', 'Image'), ('video', 'Video')])

    class Meta:
        db_table = 'media'
        ordering = ['id']


@receiver(post_delete, sender=Media)
def delete_post_media(sender, instance, **kwargs):
    transaction.on_commit(lambda: delete_media_file(instance.file))
