#from django.shortcuts import render
from rest_framework import generics
from serializers import UserSerializer, UserSimpleSerializer
from permissions import IsSelf

from django.contrib.auth.models import User


class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSimpleSerializer


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsSelf,)
