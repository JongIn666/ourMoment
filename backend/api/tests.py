from django.contrib.auth import get_user_model
from django.utils.dateparse import parse_datetime
from rest_framework.test import APIClient, APITestCase

from .models import Group, GroupMember, Post, Profile

User = get_user_model()


class PersonalPostTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = User.objects.create_user(username='owner')
        cls.other = User.objects.create_user(username='other')
        cls.group = Group.objects.create(name='Shared group')
        GroupMember.objects.create(user=cls.owner, group=cls.group)
        GroupMember.objects.create(user=cls.other, group=cls.group)
        cls.post = Post.objects.create(
            author=cls.owner,
            content='Personal moment',
            createdAt=parse_datetime('2026-06-10T12:00:00Z'),
        )
        cls.other_post = Post.objects.create(author=cls.other, content='Other personal moment')
        cls.group_post = Post.objects.create(author=cls.owner, group=cls.group, content='Group moment')

    def setUp(self):
        self.client.force_authenticate(user=self.owner)

    def test_personal_posts_require_authentication(self):
        self.client.force_authenticate(user=None)
        detail_url = f'/api/posts/{self.post.id}/'
        for method, url in [
            ('get', '/api/posts/'),
            ('post', '/api/posts/'),
            ('get', detail_url),
            ('patch', detail_url),
            ('delete', detail_url),
        ]:
            with self.subTest(method=method, url=url):
                self.assertEqual(getattr(self.client, method)(url).status_code, 401)

    def test_create_post_persists_and_can_be_loaded_by_another_client(self):
        response = self.client.post('/api/posts/', {'content': 'New moment'}, format='json')
        self.assertEqual(response.status_code, 201)
        post = Post.objects.get(pk=response.data['id'])
        self.assertEqual(post.author, self.owner)
        self.assertIsNone(post.group_id)
        self.assertIsNotNone(post.createdAt)
        self.assertIsNone(post.editedAt)

        client = APIClient()
        client.force_authenticate(user=self.owner)
        response = client.get('/api/posts/')
        self.assertIn(post.id, [item['id'] for item in response.data])
        response = client.get(f'/api/posts/{post.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['content'], 'New moment')

    def test_list_only_contains_own_personal_posts(self):
        response = self.client.get('/api/posts/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([post['id'] for post in response.data], [self.post.id])

    def test_posts_follow_selected_dates_with_consistent_order_for_equal_dates(self):
        older = self.client.post('/api/posts/', {
            'content': 'Older moment', 'createdAt': '2026-06-01T12:00:00Z',
        }, format='json')
        middle = self.client.post('/api/posts/', {
            'content': 'Middle moment', 'createdAt': '2026-06-05T12:00:00Z',
        }, format='json')
        same_date = self.client.post('/api/posts/', {
            'content': 'Same date', 'createdAt': '2026-06-10T12:00:00Z',
        }, format='json')
        for response in [older, middle, same_date]:
            self.assertEqual(response.status_code, 201)
        response = self.client.get('/api/posts/')
        self.assertEqual([post['id'] for post in response.data], [
            same_date.data['id'], self.post.id, middle.data['id'], older.data['id'],
        ])

    def test_edit_content_and_date_persists_and_reorders_timeline(self):
        detail_url = f'/api/posts/{self.post.id}/'
        response = self.client.patch(detail_url, {'content': 'Edited moment'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.post.refresh_from_db()
        self.assertEqual(self.post.content, 'Edited moment')
        self.assertIsNotNone(self.post.editedAt)

        newer = Post.objects.create(
            author=self.owner, content='Newer moment',
            createdAt=parse_datetime('2026-06-15T12:00:00Z'),
        )
        response = self.client.patch(detail_url, {'createdAt': '2026-06-20T12:00:00Z'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.post.refresh_from_db()
        self.assertEqual(self.post.createdAt, parse_datetime('2026-06-20T12:00:00Z'))
        response = self.client.get('/api/posts/')
        self.assertEqual([post['id'] for post in response.data], [self.post.id, newer.id])

    def test_group_members_cannot_access_each_others_personal_posts(self):
        detail_url = f'/api/posts/{self.other_post.id}/'
        for method in ['get', 'patch', 'delete']:
            with self.subTest(method=method):
                response = getattr(self.client, method)(detail_url, {'content': 'Changed'}, format='json')
                self.assertEqual(response.status_code, 404)
        self.other_post.refresh_from_db()
        self.assertEqual(self.other_post.content, 'Other personal moment')

    def test_create_cannot_assign_another_owner_or_group(self):
        response = self.client.post('/api/posts/', {
            'content': 'Private moment', 'author': self.other.id, 'group': self.group.id,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        post = Post.objects.get(pk=response.data['id'])
        self.assertEqual(post.author, self.owner)
        self.assertIsNone(post.group_id)

    def test_edit_rejects_ownership_and_group_changes(self):
        detail_url = f'/api/posts/{self.post.id}/'
        for field, value in [('author', self.other.id), ('group', self.group.id)]:
            with self.subTest(field=field):
                response = self.client.patch(detail_url, {'content': 'Changed', field: value}, format='json')
                self.assertEqual(response.status_code, 400)
        self.post.refresh_from_db()
        self.assertEqual(self.post.author, self.owner)
        self.assertIsNone(self.post.group_id)
        self.assertEqual(self.post.content, 'Personal moment')

    def test_invalid_content_and_dates_are_rejected(self):
        for payload in [{'content': '   '}, {'content': 'Moment', 'createdAt': 'invalid'}]:
            with self.subTest(payload=payload):
                response = self.client.post('/api/posts/', payload, format='json')
                self.assertEqual(response.status_code, 400)
                response = self.client.patch(f'/api/posts/{self.post.id}/', payload, format='json')
                self.assertEqual(response.status_code, 400)
        response = self.client.patch(f'/api/posts/{self.post.id}/', {}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_delete_removes_post_from_database_and_timeline(self):
        detail_url = f'/api/posts/{self.post.id}/'
        self.assertEqual(self.client.delete(detail_url).status_code, 204)
        self.assertFalse(Post.objects.filter(pk=self.post.id).exists())
        self.assertEqual(self.client.get('/api/posts/').data, [])
        self.assertEqual(self.client.get(detail_url).status_code, 404)

    def test_group_posts_remain_separate_and_editable(self):
        group_url = f'/api/groups/{self.group.id}/posts/'
        response = self.client.get(group_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual([post['id'] for post in response.data], [self.group_post.id])
        response = self.client.post(group_url, {'content': 'New group moment'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['group'], self.group.id)
        response = self.client.patch(f'/api/posts/{self.group_post.id}/', {
            'content': 'Edited group moment', 'createdAt': '2026-06-10T12:00:00Z',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['group'], self.group.id)
        self.assertEqual(self.client.get('/api/posts/').data[0]['id'], self.post.id)

    def test_group_members_cannot_edit_or_delete_another_authors_group_posts(self):
        self.client.force_authenticate(user=self.other)
        detail_url = f'/api/posts/{self.group_post.id}/'
        self.assertEqual(self.client.patch(detail_url, {'content': 'Changed'}, format='json').status_code, 403)
        self.assertEqual(self.client.delete(detail_url).status_code, 403)


class GroupInviteTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.member = User.objects.create_user(username='member')
        cls.joiner = User.objects.create_user(username='joiner')
        cls.group = Group.objects.create(name='Invited group')
        GroupMember.objects.create(user=cls.member, group=cls.group)

    def setUp(self):
        self.client.force_authenticate(user=self.joiner)

    def test_new_groups_get_distinct_codes_that_members_can_read(self):
        response = self.client.post('/api/groups/', {'name': 'New group'}, format='json')
        self.assertEqual(response.status_code, 201)
        code = response.data['inviteCode']
        self.assertEqual(len(code), 10)
        self.assertNotEqual(code, self.group.inviteCode)
        response = self.client.get(f"/api/groups/{response.data['id']}/")
        self.assertEqual(response.data['inviteCode'], code)

    def test_nonmembers_cannot_read_group_or_invite_code_until_they_join(self):
        self.assertEqual(self.client.get(f'/api/groups/{self.group.id}/').status_code, 404)
        self.assertEqual(self.client.get('/api/groups/').data, [])
        response = self.client.post('/api/groups/join/', {
            'inviteCode': f' {self.group.inviteCode.lower()} ',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], self.group.id)
        self.assertTrue(GroupMember.objects.filter(user=self.joiner, group=self.group).exists())
        response = self.client.get(f'/api/groups/{self.group.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.joiner.id, [member['id'] for member in response.data['members']])
        self.assertEqual(self.client.get('/api/groups/').data[0]['id'], self.group.id)
        self.assertEqual(self.client.get(f'/api/groups/{self.group.id}/posts/').status_code, 200)

    def test_join_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/groups/join/', {'inviteCode': self.group.inviteCode}, format='json')
        self.assertEqual(response.status_code, 401)
        self.assertFalse(GroupMember.objects.filter(user=self.joiner, group=self.group).exists())

    def test_invalid_codes_do_not_add_members(self):
        for payload in [{}, {'inviteCode': ''}, {'inviteCode': 'short'}, {'inviteCode': '0000000000'}]:
            with self.subTest(payload=payload):
                response = self.client.post('/api/groups/join/', payload, format='json')
                self.assertEqual(response.status_code, 400)
        self.assertFalse(GroupMember.objects.filter(user=self.joiner, group=self.group).exists())

    def test_repeated_join_does_not_duplicate_membership(self):
        for _ in range(2):
            response = self.client.post('/api/groups/join/', {'inviteCode': self.group.inviteCode}, format='json')
            self.assertEqual(response.status_code, 200)
        self.assertEqual(GroupMember.objects.filter(user=self.joiner, group=self.group).count(), 1)

    def test_members_cannot_set_or_change_the_invite_code(self):
        response = self.client.post('/api/groups/', {
            'name': 'Another group', 'inviteCode': '0000000000',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        code = response.data['inviteCode']
        self.assertNotEqual(code, '0000000000')
        response = self.client.patch(f"/api/groups/{response.data['id']}/", {
            'inviteCode': self.group.inviteCode,
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['inviteCode'], code)


class UserPersistenceTests(APITestCase):
    def test_registration_saves_user_and_profile_and_allows_login(self):
        password = 'moment-passphrase-2026'
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': password,
            'confirmPassword': password,
            'displayName': 'New User',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='newuser')
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertNotEqual(user.password, password)
        self.assertTrue(user.check_password(password))
        self.assertEqual(Profile.objects.get(user=user).displayName, 'New User')

        client = APIClient()
        response = client.post('/api/auth/login/', {
            'identifier': 'newuser', 'password': password,
        }, format='json')
        self.assertEqual(response.status_code, 200)
        client.credentials(HTTP_AUTHORIZATION=f"Token {response.data['token']}")
        self.assertEqual(client.get('/api/auth/me/').data['id'], user.id)
        response = client.patch('/api/profile/', {'bio': 'Saved profile'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Profile.objects.get(user=user).bio, 'Saved profile')
