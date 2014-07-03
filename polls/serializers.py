from rest_framework import serializers
import models


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Choice
        fields = ('id', 'text')


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, source='choice_set')
    class Meta:
        model = models.Question
        fields = ('id', 'text', 'choices')


class CitySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, source='question_set')
    image = serializers.Field(source='image.url')
    class Meta:
        model = models.City
        fields = ('id', 'name', 'description', 'image', 'questions')


class RegionSerializer(serializers.ModelSerializer):
    cities = CitySerializer(many=True, source='city_set')
    image = serializers.Field(source='image.url')
    class Meta:
        model = models.Region
        fields = ('id', 'name', 'image', 'cities')
