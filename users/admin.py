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


class RankingAdmin(admin.ModelAdmin):
    list_display = ['id', 'last_modified', 'platform', 'score', 'user']


admin.site.register(models.Answer, AnwserAdmin)
admin.site.register(models.Play, PlayAdmin)
admin.site.register(models.Ranking, RankingAdmin)
