import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_group_reactionemojis'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='isDraft',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='post',
            name='reactionCounts',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='post',
            name='weather',
            field=models.CharField(blank=True, choices=[('', 'No weather'), ('sunny', 'Sunny'), ('partly_cloudy', 'Partly cloudy'), ('cloudy', 'Cloudy'), ('rainy', 'Rainy'), ('stormy', 'Stormy'), ('snowy', 'Snowy'), ('windy', 'Windy'), ('foggy', 'Foggy')], default='', max_length=20),
        ),
        migrations.CreateModel(
            name='Reaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('emoji', models.CharField(max_length=16)),
                ('createdAt', models.DateTimeField(auto_now_add=True)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='api.post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='postReactions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'reaction',
                'ordering': ['createdAt', 'id'],
                'constraints': [models.UniqueConstraint(fields=('user', 'post', 'emoji'), name='unique_user_post_emoji_reaction')],
            },
        ),
    ]
