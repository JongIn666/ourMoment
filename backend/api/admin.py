#simple admin with group
#you can add other things for testing purposes as well

from django.contrib import admin

from .models import Group, GroupMember

class GroupMemberInline(admin.TabularInline):
    model = GroupMember
    extra = 1

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'createdAt')
    inlines = [GroupMemberInline]