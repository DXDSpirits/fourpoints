from datetime import datetime
from django.contrib.auth.models import User
from .models import Play, Answer, Ranking
#from polls.models import Choice, Question
from rest_framework import serializers


class UserSimpleSerializer(serializers.ModelSerializer):
    def validate_username(self, attrs, source):
        #username = attrs[source]
        return attrs
    class Meta:
        model = User
        fields = ('id', 'username')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('choice', 'question')


class PlaySerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, source="answer_set", allow_add_remove=True, required=False)
    def validate_answers(self, attrs, source):
        if source not in attrs:
            attrs[source] = []
        return attrs
    def validate_time(self, attrs, source):
        if hasattr(self.object, 'time_created'):
            attrs[source] = (datetime.now() - self.object.time_created).total_seconds()
        else:
            attrs[source] = 0
        return attrs
    def validate(self, attrs):
        answers = attrs['answer_set']
        solved = sum([1 for answer in answers if answer.choice.right])
        attrs['score'] = int((solved * 5) * (attrs['time'] * 10))
        attrs['solved'] = solved
        attrs['complete'] = len(answers) > 0
        return attrs
    class Meta:
        model = Play
        fields = ('id', 'time_created', 'user', 'city', 'complete', 'platform', 
                  'score', 'time', 'solved', 'answers')
        read_only_fields = ('user', 'score', 'solved', 'time', 'complete')


class RankingSerializer(serializers.ModelSerializer):
    user = serializers.RelatedField()
    class Meta:
        model = Ranking
        fields = ('platform', 'user', 'score')
