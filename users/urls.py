from django.conf.urls import patterns, url
import apiviews

urlpatterns = patterns('',
    url(r'^user/$', apiviews.UserList.as_view()),
    url(r'^user/(?P<pk>[0-9]+)/$', apiviews.UserDetail.as_view()),
)
