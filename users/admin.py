from django.contrib import admin
import models


class AnwserAdmin(admin.ModelAdmin):
    list_display = ['id', 'choice', 'question', 'time_created']


class PlayAdmin(admin.ModelAdmin):
    class AnswerInline(admin.TabularInline):
        model = models.Answer
        extra = 0
    list_display = ['id', 'time_created', 'user', 'city', 'score', 'complete', 'platform']
    inlines = [AnswerInline]


admin.site.register(models.Answer, AnwserAdmin)
admin.site.register(models.Play, PlayAdmin)
