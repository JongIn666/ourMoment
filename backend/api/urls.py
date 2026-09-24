from django.urls import path

from .views import health, login, logout, me, profile, register

urlpatterns = [
    path('health/', health, name='health'),
    path('auth/register/', register, name='auth-register'),
    path('auth/login/', login, name='auth-login'),
    path('auth/logout/', logout, name='auth-logout'),
    path('auth/me/', me, name='auth-me'),
    path('profile/', profile, name='profile'),
]
