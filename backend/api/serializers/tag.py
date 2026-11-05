import re

from rest_framework import serializers
from ..models.tag import Tag

HEX_COLOR = re.compile(r'^#[0-9A-Fa-f]{6}$')

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']

    def validate_name(self, name):
        name = name.strip()
        if not name:
            raise serializers.ValidationError('Give the tag a name.')
        group = self.instance.group if self.instance else self.context['group']
        existing = Tag.objects.filter(group=group, name__iexact=name)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError('This group already has a tag with that name.')
        return name

    def validate_color(self, color):
        if color and not HEX_COLOR.match(color):
            raise serializers.ValidationError('Use a proper color code.')
        return color.upper()