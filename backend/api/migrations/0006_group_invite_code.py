import api.models.group
from django.db import migrations, models


def populate_invite_codes(apps, schema_editor):
    Group = apps.get_model('api', 'Group')
    groups = Group.objects.using(schema_editor.connection.alias)
    for group in groups.all().iterator():
        code = api.models.group.generate_invite_code()
        while groups.filter(inviteCode=code).exists():
            code = api.models.group.generate_invite_code()
        group.inviteCode = code
        group.save(using=schema_editor.connection.alias, update_fields=['inviteCode'])


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0005_alter_post_options_alter_post_group'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='inviteCode',
            field=models.CharField(editable=False, max_length=10, null=True, unique=True),
        ),
        migrations.RunPython(populate_invite_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='group',
            name='inviteCode',
            field=models.CharField(default=api.models.group.generate_invite_code, editable=False, max_length=10, unique=True),
        ),
    ]
