from django.contrib import admin
import models


class AnwserAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'choice', 'question', 'time_created']


class PlayAdmin(admin.ModelAdmin):
    list_display = ['id', 'time_created', 'user', 'city', 'score', 'complete', 'platform']


admin.site.register(models.Answer, AnwserAdmin)
admin.site.register(models.Play, PlayAdmin)
