from django.urls import path

from .views import change_email, health, login, logout, me, profile, register, group, group_detail

urlpatterns = [
    path('health/', health, name='health'),
    path('auth/register/', register, name='auth-register'),
    path('auth/login/', login, name='auth-login'),
    path('auth/logout/', logout, name='auth-logout'),
    path('auth/me/', me, name='auth-me'),
    path('auth/email/', change_email, name='auth-email'),
    path('profile/', profile, name='profile'),
    path('groups/', group, name='groups'),
    path('groups/<int:group_id>/', group_detail, name='group-detail'),
]
