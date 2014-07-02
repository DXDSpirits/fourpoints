from django.conf.urls import include, patterns, url
from rest_framework import routers
import apiviews

router = routers.DefaultRouter()


urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^user/$', apiviews.UserList.as_view()),
    url(r'^user/(?P<pk>[0-9]+)/$', apiviews.UserDetail.as_view()),
    url(r'^play/$', apiviews.PlayViewSet.as_view()),
)
