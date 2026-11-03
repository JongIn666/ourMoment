from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_media'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='link',
            field=models.URLField(blank=True, max_length=2048),
        ),
    ]
