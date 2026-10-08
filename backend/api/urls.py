from django.urls import path

from .views import (
    change_email,
    google_login,
    group,
    group_detail,
    group_posts,
    health,
    login,
    logout,
    me,
    post_detail,
    profile,
    register,
)

urlpatterns = [
    path('health/', health, name='health'),
    path('auth/register/', register, name='auth-register'),
    path('auth/login/', login, name='auth-login'),
    path('auth/google/', google_login, name='auth-google'),
    path('auth/logout/', logout, name='auth-logout'),
    path('auth/me/', me, name='auth-me'),
    path('auth/email/', change_email, name='auth-email'),
    path('profile/', profile, name='profile'),
    path('groups/', group, name='groups'),
    path('groups/<int:group_id>/', group_detail, name='group-detail'),
    path('groups/<int:group_id>/posts/', group_posts, name='group-posts'),
    path('posts/<int:post_id>/', post_detail, name='post-detail'),
]
