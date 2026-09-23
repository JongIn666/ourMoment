from django.urls import path

from .views import health, profile

urlpatterns = [
    path('health/', health, name='health'),
    path('profile/', profile, name='profile'),
]
