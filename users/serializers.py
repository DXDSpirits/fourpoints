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
        attrs['score'] = 0
        attrs['complete'] = False
        if source in attrs:
            attrs['score'] = sum([5 for answer in attrs[source] if answer.choice.right])
            attrs['complete'] = True
        return attrs
    class Meta:
        model = Play
        fields = ('id', 'time_created', 'user', 'city', 'score', 'complete', 'platform', 'answers')
        read_only_fields = ('user', 'score', 'complete')


class RankingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ranking
        fields = ('platform', 'user', 'score')
