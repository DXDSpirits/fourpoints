from django.contrib import admin
import models
import polls


class ChoiceAdmin(admin.ModelAdmin):
    def suit_row_attributes(self, obj, request):
        if obj.right:
            return {'class': 'success'}
        else:
            return {}
    def of_city(self, obj):
        return obj.question.city
    of_city.short_description = 'City'  
    list_display = ['id', 'of_city', 'question', 'text', 'right']
    list_display_links = ['id', 'text']
    list_editable = ['right']
    ordering = ['id']
    list_per_page = 40


class QuestionAdmin(admin.ModelAdmin):
    class ChoiceInline(admin.TabularInline):
        model = models.Choice
        extra = 0
    list_display = ['id', 'city', 'text']
    list_display_links = ['id', 'text']
    inlines = [ChoiceInline]


class CityAdmin(admin.ModelAdmin):
    class QuestionInline(admin.StackedInline):
        model = models.Question
        extra = 0
    
    def thumbnail(self, instance):
        return u'<img src="%s" style="max-width:100px;height:50px;" alt="" />' % instance.image.url
    thumbnail.allow_tags = True
    thumbnail.short_description = "Thumbnail"
    
    def random_questions(self, request, queryset):
        for city in queryset:
            polls.random_questions(city)
    random_questions.short_description = "Generate Random Questions"
    
    list_display = ['id', 'name', 'thumbnail', 'adurl']
    list_display_links = ['id', 'name']
    inlines = [QuestionInline]
    actions = ['random_questions']


class RegionAdmin(admin.ModelAdmin):
    class CityInline(admin.StackedInline):
        model = models.City
        extra = 0
    def thumbnail(self, instance):
        return u'<img src="%s" style="max-width:100px;height:50px;" alt="" />' % instance.image.url
    thumbnail.allow_tags = True
    thumbnail.short_description = "Thumbnail"
    list_display = ['id', 'name', 'thumbnail']
    list_display_links = ['id', 'name']
    inlines = [CityInline]


admin.site.register(models.Choice, ChoiceAdmin)
admin.site.register(models.Question, QuestionAdmin)
admin.site.register(models.City, CityAdmin)
admin.site.register(models.Region, RegionAdmin)
