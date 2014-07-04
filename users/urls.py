from django.conf.urls import include, patterns, url
from rest_framework import routers
import apiviews


router = routers.DefaultRouter()
router.register(r'play', apiviews.PlayViewSet)
router.register(r'ranking', apiviews.RankingViewSet)


urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^user/$', apiviews.UserListCreate.as_view()),
    url(r'^user/(?P<pk>[0-9]+)/$', apiviews.UserDetail.as_view()),
    url(r'^user/(?P<pk>[0-9]+)/verify/$', apiviews.UserVerify.as_view()),
)
