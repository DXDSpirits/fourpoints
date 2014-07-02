from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from polls.models import Choice, Question, City


@receiver(post_save, sender=get_user_model())
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class Play(models.Model):
    user = models.ForeignKey(User)
    city = models.ForeignKey(City)
    score = models.IntegerField()
    
    time_created = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    
    complete = models.BooleanField()
    platform = models.SlugField()
    
    class Meta:
        index_together= [['user', 'time_created',],
                         ['city', 'time_created',],]
        ordering = ['time_created']
    
    def __unicode__(self):
        return u'%s %s' % (unicode(self.user), unicode(self.city))


class Answer(models.Model):
    play = models.ForeignKey(Play)
    
    question = models.ForeignKey(Question)
    choice = models.ForeignKey(Choice)
    
    time_created = models.DateTimeField(auto_now_add=True)
