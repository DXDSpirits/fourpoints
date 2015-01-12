#from django.shortcuts import render

import django_filters
import random

from django.contrib.auth.models import User

from .models import Play, Ranking, VerifyCode
from .serializers import UserSerializer, UserSimpleSerializer, PlaySerializer, RankingSerializer
from .permissions import IsSelf, Answerable#, IsOwner
from .sms import send_veriry_code

from rest_framework import generics, filters, viewsets, status, mixins, decorators
from rest_framework.response import Response
from rest_framework.views import APIView


class UserListCreate(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSimpleSerializer
    
    def get_queryset(self):
        return self.queryset.filter(id=self.request.user.id)


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsSelf,)


class CodeView(APIView):
    def post(self, request, *args, **kwargs):
        mobile = request.DATA.get('mobile')
        if mobile:
            code = str(random.randint(1000, 9999))
            send_veriry_code(mobile, code)
            #code = 1234
            verifycode, created = VerifyCode.objects.get_or_create(mobile = mobile,
                                                                   defaults={'code': code})
            if not created:
                verifycode.code = code
                verifycode.save(update_fields=['code'])
            return Response({'status': 'Sent'})
        return Response({'status': 'Invalid Mobile'}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, *args, **kwargs):
        mobile = request.DATA.get('mobile')
        code = request.DATA.get('code')
        verifycode = VerifyCode.objects.get(mobile = mobile)
        if verifycode.code == code:
            user, created = User.objects.get_or_create(username=mobile)
            if created:
                user.set_password(mobile)
                user.save()
            return Response({'status': 'Verified'})
        else:
            return Response({'status': 'Invalid Code'},
                            status=status.HTTP_400_BAD_REQUEST)


class IsOwnerFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        pk = view.kwargs.get(view.lookup_field, None)
        method = request.method
        if (method in {'GET'} and pk is None):
            if request.user.is_authenticated():
                return queryset.filter(user=request.user)
            else:
                return queryset.none()
        else:
            return queryset


class PlayViewSet(mixins.CreateModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  #mixins.DestroyModelMixin,
                  mixins.ListModelMixin,
                  viewsets.GenericViewSet):
    queryset = Play.objects.all()
    serializer_class = PlaySerializer
    #permission_classes = (IsOwner, Answerable)
    permission_classes = (Answerable,)
    filter_backends = (IsOwnerFilterBackend,)
    
    def pre_save(self, obj):
        user = self.request.user
        obj.user = user if user.is_authenticated() else None
    
    @decorators.action(methods=['put'],permission_classes=[])
    def belong(self, request, pk=None):
        user = self.request.user
        obj = self.get_object()
        if user.is_authenticated() and obj.user is None:
            obj.user = user
            obj.save(update_fields=['user'])
        serializer = PlaySerializer(obj, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class RankingViewSet(viewsets.ReadOnlyModelViewSet):
    class RankingFilter(django_filters.FilterSet):
        class Meta:
            model = Ranking
            #fields = ['platform', 'user']
            fields = ['user']
            ordering = ['-score']
    queryset = Ranking.objects.all()
    serializer_class = RankingSerializer
    filter_class = RankingFilter
    paginate_by = 10
