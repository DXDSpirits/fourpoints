from django.db import models
from .fields import rename


def image_name(self, filename):
    return 'images/' + rename(filename)


class Region(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to=image_name)
    
    def __unicode__(self):
        return unicode(self.name)


class City(models.Model):
    region = models.ForeignKey(Region)
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to=image_name)
    
    description = models.TextField()
    
    def __unicode__(self):
        return unicode(self.name)
    class Meta:
        verbose_name_plural = 'Cities'


class Question(models.Model):
    city = models.ForeignKey(City)
    text = models.CharField(max_length=200)
    
    def __unicode__(self):
        return unicode(self.text)


class Choice(models.Model):
    question = models.ForeignKey(Question)
    text = models.CharField(max_length=200)
    right = models.BooleanField()
    
    def __unicode__(self):
        return unicode(self.text)
