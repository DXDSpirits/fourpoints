#from django.shortcuts import render

from django.contrib.auth.models import User

from .models import Play
from .serializers import UserSerializer, UserSimpleSerializer, PlaySerializer
from .permissions import IsSelf, IsOwner

from rest_framework import generics, filters#, viewsets


class IsOwnerFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        pk = view.kwargs.get(view.lookup_field, None)
        method = request.method
        if (method in {'GET'} and pk is None):
            return queryset.filter(user=request.user)
        else:
            return queryset


class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSimpleSerializer


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsSelf,)


class PlayViewSet(generics.ListCreateAPIView):
    queryset = Play.objects.all()
    serializer_class = PlaySerializer
    permission_classes = (IsOwner,)
    filter_backends = (IsOwnerFilterBackend,)
    
    def pre_save(self, obj):
        obj.user = self.request.user
        obj.score = 0
        obj.complete = False
