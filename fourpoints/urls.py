from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'fourpoints.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    
    url(r'^api/auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api/token-auth/', 'rest_framework.authtoken.views.obtain_auth_token'),
    
    url(r'^api/users/', include('users.urls')),
    url(r'^api/polls/', include('polls.urls')),
    
    url(r'^$', TemplateView.as_view(template_name='index.html')),
)


from django.conf import settings
try:
    if settings.LOCAL_SETTINGS and settings.DEBUG:
        from django.conf.urls.static import static
        urlpatterns += static('/media/', document_root = settings.MEDIA_ROOT)
except:
    pass
