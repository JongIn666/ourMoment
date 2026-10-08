from .auth import change_email, google_login, login, logout, me, register
from .health import health
from .profile import profile, profile_picture
from .group import group, group_detail
from .post import group_posts, post_detail

__all__ = [
	'health', 'login', 'logout', 'me', 'profile', 'profile_picture', 'register', 'group', 'group_detail',
	'group_posts', 'post_detail', 'change_email', 'google_login',
]
