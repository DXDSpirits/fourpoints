#from django.shortcuts import render

import django_filters
import random

from django.contrib.auth.models import User

from .models import Play, Ranking
from .serializers import UserSerializer, UserSimpleSerializer, PlaySerializer, RankingSerializer
from .permissions import IsSelf, IsOwner, Answerable
from .sms import send_veriry_code

from rest_framework import generics, filters, viewsets, status, mixins
from rest_framework.response import Response


class IsOwnerFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        pk = view.kwargs.get(view.lookup_field, None)
        method = request.method
        if (method in {'GET'} and pk is None):
            return queryset.filter(user=request.user)
        else:
            return queryset


class UserListCreate(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSimpleSerializer
    
    def pre_save(self, obj):
        code = str(random.randint(1000, 9999))
        send_veriry_code(obj.username, code)
        obj.set_password(code)
        obj.is_active = False


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsSelf,)


class UserVerify(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def put(self, request, *args, **kwargs):
        user = self.get_object()
        code = request.DATA.get('code')
        if user.check_password(code):
            user.set_password(user.username)
            user.is_active = True
            user.save(update_fields=['is_active', 'password'])
            return Response({'status': 'Verified'})
        else:
            return Response({'status': 'Invalid Code'},
                            status=status.HTTP_400_BAD_REQUEST)


class PlayViewSet(mixins.CreateModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  #mixins.DestroyModelMixin,
                  mixins.ListModelMixin,
                  viewsets.GenericViewSet):
    queryset = Play.objects.all()
    serializer_class = PlaySerializer
    permission_classes = (IsOwner, Answerable)
    filter_backends = (IsOwnerFilterBackend,)
    
    def pre_save(self, obj):
        obj.user = self.request.user


class RankingViewSet(viewsets.ReadOnlyModelViewSet):
    class RankingFilter(django_filters.FilterSet):
        class Meta:
            model = Ranking
            fields = ['platform', 'user']
            ordering = ['-score']
    queryset = Ranking.objects.all()
    serializer_class = RankingSerializer
    filter_class = RankingFilter
