from django.db import models
from django.conf import settings

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    displayName = models.CharField(max_length=30, blank=True) # if not provided, defaults to the user's username
    birthday = models.DateField(blank=True, null=True)
    showAge = models.BooleanField(default=False)
    showBirthday = models.BooleanField(default=False)
    profilePicUrl = models.URLField(max_length=200, blank=True) # for later aws S3 integration
    bio = models.TextField(max_length=500, blank=True)

    class Meta:
        db_table = 'profile'

    # Additional profile fields can be added here
    
    def __str__(self):
        return self.user.username