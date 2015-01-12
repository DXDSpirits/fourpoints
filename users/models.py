from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from polls.models import Choice, Question, City


class VerifyCode(models.Model):
    mobile = models.SlugField()
    code = models.IntegerField()
    
    time_created = models.DateTimeField(auto_now_add=True)
    
    def __unicode__(self):
        return self.mobile


#@receiver(post_save, sender=get_user_model())
@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class Play(models.Model):
    user = models.ForeignKey(User, null=True)
    city = models.ForeignKey(City)
    
    score = models.IntegerField()
    time = models.FloatField()
    solved = models.IntegerField()
    
    time_created = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    
    complete = models.BooleanField(default=False)
    platform = models.SlugField()
    
    class Meta:
        index_together = [['user', 'time_created',],
                          ['city', 'time_created',],]
        ordering = ['time_created']
    
    def __unicode__(self):
        return u'%s %s' % (unicode(self.user), unicode(self.city))


class Answer(models.Model):
    play = models.ForeignKey(Play)
    
    question = models.ForeignKey(Question)
    choice = models.ForeignKey(Choice)
    
    time_created = models.DateTimeField(auto_now_add=True)


class Ranking(models.Model):
    user = models.ForeignKey(User)
    score = models.IntegerField(db_index=True)
    platform = models.SlugField()
    
    last_modified = models.DateTimeField(auto_now=True)
    
    class Meta:
        index_together = [['platform', 'score',],]
        #ordering = ['platform', '-score']
        ordering = ['-score']

@receiver(post_save, sender=Play)
def update_ranking(sender, instance=None, created=False, **kwargs):
    if instance.complete and instance.user is not None:
        ranking, _created = Ranking.objects.get_or_create(user=instance.user,
                                                          platform=instance.platform,
                                                          defaults={'score': 0})
        ranking.score += instance.score
        ranking.save(update_fields=['score'])
