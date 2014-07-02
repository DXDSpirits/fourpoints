from django.conf.urls import patterns, url, include
from rest_framework import routers
import apiviews

router = routers.DefaultRouter()

router.register(r'question', apiviews.QuestionViewSet)
router.register(r'city', apiviews.CityViewSet)
router.register(r'region', apiviews.RegionViewSet)


urlpatterns = patterns('',
    url(r'^', include(router.urls))
)
