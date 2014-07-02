#from django.shortcuts import render
from .models import Question, City, Region 
from .serializers import QuestionSerializer, CitySerializer, RegionSerializer
from rest_framework import viewsets


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    filter_fields = ('city',)


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    filter_fields = ('region',)


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
