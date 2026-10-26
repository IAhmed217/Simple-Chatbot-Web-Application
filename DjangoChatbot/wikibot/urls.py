from django.urls import path
from . import views

urlpatterns = [
    path('', views.homepage_view, name='wikibot_view'),
    path('chat', views.send_query, name='send_query')
]