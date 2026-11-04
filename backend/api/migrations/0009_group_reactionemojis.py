import api.models.group
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_post_link'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='reactionEmojis',
            field=models.JSONField(default=api.models.group.default_reaction_emojis),
        ),
    ]
