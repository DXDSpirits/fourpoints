from django.contrib.auth.models import User
from .models import Play, Answer
from rest_framework import serializers


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')


class PlaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Play
        fields = ('id', 'time_created', 'user', 'city', 'score', 'complete', 'platform')
        read_only_fields = ('user', 'score', 'complete')


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('id', 'user', 'choice', 'question')
