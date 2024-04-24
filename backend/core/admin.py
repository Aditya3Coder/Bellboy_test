from django.contrib import admin

# Register your models here.
from .models import *


@admin.register(Snippet)
class studentadmin(admin.ModelAdmin):
    list_display = ['id','name','Address']



admin.site.register(Booking)
admin.site.register(Customer)
admin.site.register(Property)
admin.site.register(Feedback)
admin.site.register(LateCheckOutRequest)

from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin


class MyUserAdmin(UserAdmin):
    model = User

    fieldsets = UserAdmin.fieldsets + (
            (None, {'fields': ('role','contact')}),
    )

admin.site.register(User, MyUserAdmin)

@admin.register(Building)
class MyBuildings(admin.ModelAdmin):
    list_display = ['id','name','address']
