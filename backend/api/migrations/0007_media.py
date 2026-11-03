import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_group_invite_code'),
    ]

    operations = [
        migrations.CreateModel(
            name='Media',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.CharField(max_length=500)),
                ('type', models.CharField(choices=[('image', 'Image'), ('video', 'Video')], max_length=5)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='media', to='api.post')),
            ],
            options={
                'db_table': 'media',
                'ordering': ['id'],
            },
        ),
    ]
