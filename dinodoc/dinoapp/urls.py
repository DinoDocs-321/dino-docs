from django.urls import include, re_path



from . import views


urlpatterns = [
    re_path(r'^$', views.HomePageView.as_view(), name='home'), # Notice the URL has been named
    re_path(r'^about/$', views.AboutPageView.as_view(), name='about'),
]
