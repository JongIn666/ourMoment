import base64
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils.dateparse import parse_datetime
from rest_framework.test import APIClient, APITestCase

from .models import Group, GroupMember, Media, Post, Profile
from .storage import save_media_file

User = get_user_model()


class PostMediaTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = User.objects.create_user(username='media-owner')
        cls.member = User.objects.create_user(username='media-member')
        cls.outsider = User.objects.create_user(username='media-outsider')
        cls.group = Group.objects.create(name='Media group')
        GroupMember.objects.create(user=cls.owner, group=cls.group)
        GroupMember.objects.create(user=cls.member, group=cls.group)

    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.media_root = directory.name
        settings_override = override_settings(AWS_S3_BUCKET='', MEDIA_ROOT=self.media_root)
        settings_override.enable()
        self.addCleanup(settings_override.disable)
        self.client.force_authenticate(user=self.owner)
        self.group_url = f'/api/groups/{self.group.id}/posts/'

    def image(self, size=None):
        content = base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHioAAAAASUVORK5CYII='
        ) if size is None else b'x' * size
        return SimpleUploadedFile('photo.png', content, content_type='image/png')

    def video(self, size=32):
        return SimpleUploadedFile('clip.mp4', b'x' * size, content_type='video/mp4')

    def test_multiple_images_and_video_persist_and_reload_in_order(self):
        response = self.client.post(self.group_url, {
            'content': 'With attachments',
            'uploads': [self.image(), self.video(), self.image()],
        }, format='multipart')
        self.assertEqual(response.status_code, 201)
        post = Post.objects.get(pk=response.data['id'])
        self.assertEqual(list(post.media.values_list('type', flat=True)), ['image', 'video', 'image'])
        self.assertEqual([item['type'] for item in response.data['media']], ['image', 'video', 'image'])
        for media in post.media.all():
            self.assertTrue(default_storage.exists(media.file))

        client = APIClient()
        client.force_authenticate(user=self.owner)
        for url in [self.group_url, '/api/posts/mine/', f'/api/posts/{post.id}/']:
            response = client.get(url)
            self.assertEqual(response.status_code, 200)
            data = response.data[0] if isinstance(response.data, list) else response.data
            self.assertEqual(len(data['media']), 3)

    def test_media_only_posts_are_allowed_and_remain_editable(self):
        response = self.client.post('/api/posts/', {'uploads': [self.image()]}, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['content'], '')
        response = self.client.patch(f"/api/posts/{response.data['id']}/", {
            'content': '', 'createdAt': '2026-11-01T12:00:00Z',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['media']), 1)

    def test_oversized_images_and_videos_are_rejected_before_any_files_are_saved(self):
        for oversized in [self.image(8 * 1024 * 1024 + 1), self.video(8 * 1024 * 1024 + 1)]:
            with self.subTest(type=oversized.content_type):
                response = self.client.post(self.group_url, {
                    'content': 'Too large', 'uploads': [self.image(), oversized],
                }, format='multipart')
                self.assertEqual(response.status_code, 400)
                self.assertIn('8 MB', str(response.data))
                self.assertFalse(Post.objects.exists())
                self.assertFalse(Media.objects.exists())
                self.assertEqual(list(Path(self.media_root).rglob('*')), [])

    def test_exactly_eight_mb_is_allowed_and_limit_is_per_file(self):
        response = self.client.post(self.group_url, {
            'content': 'At the limit', 'uploads': [self.image(8 * 1024 * 1024), self.video()],
        }, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data['media']), 2)

    def test_non_media_uploads_are_rejected(self):
        response = self.client.post(self.group_url, {
            'content': 'Document',
            'uploads': [SimpleUploadedFile('file.txt', b'text', content_type='text/plain')],
        }, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Post.objects.exists())

    def test_personal_media_is_only_accessible_to_its_author(self):
        response = self.client.post('/api/posts/', {'uploads': [self.image()]}, format='multipart')
        post_id = response.data['id']
        media_url = f"/api/media/{response.data['media'][0]['id']}/"
        response = self.client.get(media_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'image/png')
        self.assertEqual(b''.join(response.streaming_content), self.image().read())

        self.client.force_authenticate(user=self.member)
        self.assertEqual(self.client.get(media_url).status_code, 404)
        self.assertEqual(self.client.get(f'/api/posts/{post_id}/').status_code, 404)
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(media_url).status_code, 401)

    def test_group_media_requires_current_membership(self):
        response = self.client.post(self.group_url, {'uploads': [self.video()]}, format='multipart')
        media_url = f"/api/media/{response.data['media'][0]['id']}/"
        self.client.force_authenticate(user=self.member)
        response = self.client.get(media_url)
        self.assertEqual(response.status_code, 200)
        response.close()
        GroupMember.objects.filter(user=self.member, group=self.group).delete()
        self.assertEqual(self.client.get(media_url).status_code, 404)
        self.client.force_authenticate(user=self.outsider)
        self.assertEqual(self.client.get(media_url).status_code, 404)

    def test_unauthenticated_users_and_nonmembers_cannot_upload(self):
        for user, expected_status in [(None, 401), (self.outsider, 404)]:
            with self.subTest(user=user):
                self.client.force_authenticate(user=user)
                response = self.client.post(self.group_url, {'uploads': [self.image()]}, format='multipart')
                self.assertEqual(response.status_code, expected_status)
        self.assertFalse(Media.objects.exists())

    def test_deleting_a_post_removes_its_media_and_files(self):
        response = self.client.post(self.group_url, {'uploads': [self.image(), self.video()]}, format='multipart')
        files = list(Media.objects.values_list('file', flat=True))
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(f"/api/posts/{response.data['id']}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Media.objects.exists())
        self.assertTrue(all(not default_storage.exists(key) for key in files))

    def test_upload_failure_rolls_back_post_and_cleans_up_saved_files(self):
        from rest_framework.exceptions import APIException

        saved_files = []

        def save_or_fail(upload, key):
            if saved_files:
                raise APIException('Could not upload your media.')
            saved_files.append(save_media_file(upload, key))
            return saved_files[-1]

        with patch('api.serializers.post.save_media_file', side_effect=save_or_fail):
            response = self.client.post(self.group_url, {
                'content': 'Upload failure', 'uploads': [self.image(), self.video()],
            }, format='multipart')
        self.assertEqual(response.status_code, 500)
        self.assertFalse(Post.objects.exists())
        self.assertFalse(Media.objects.exists())
        self.assertFalse(default_storage.exists(saved_files[0]))

    def test_edit_adds_and_removes_media_and_preserves_remaining_attachments(self):
        response = self.client.post(self.group_url, {
            'content': 'Original', 'uploads': [self.image(), self.video()],
        }, format='multipart')
        post = Post.objects.get(pk=response.data['id'])
        kept, removed = list(post.media.all())
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(f'/api/posts/{post.id}/', {
                'content': 'Edited', 'createdAt': '2026-11-01T12:00:00Z',
                'uploads': [self.image(), self.video()], 'removedMedia': [removed.id],
            }, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['type'] for item in response.data['media']], ['image', 'image', 'video'])
        self.assertEqual(response.data['media'][0]['id'], kept.id)
        self.assertFalse(default_storage.exists(removed.file))
        self.assertTrue(default_storage.exists(kept.file))
        post.refresh_from_db()
        self.assertEqual(post.content, 'Edited')
        self.assertEqual(post.createdAt, parse_datetime('2026-11-01T12:00:00Z'))
        self.assertIsNotNone(post.editedAt)
        reloaded = self.client.get(f'/api/posts/{post.id}/')
        self.assertEqual(reloaded.data['media'], response.data['media'])

    def test_edit_rejects_removal_of_another_posts_media_and_oversized_uploads(self):
        first = self.client.post(self.group_url, {
            'content': 'Original', 'uploads': [self.image()],
        }, format='multipart')
        second = self.client.post(self.group_url, {'uploads': [self.video()]}, format='multipart')
        post = Post.objects.get(pk=first.data['id'])
        original_media = post.media.get()
        for payload in [
            {'removedMedia': [second.data['media'][0]['id']]},
            {'uploads': [self.video(8 * 1024 * 1024 + 1)], 'removedMedia': [original_media.id]},
            {'uploads': [SimpleUploadedFile('file.txt', b'text', content_type='text/plain')]},
        ]:
            with self.subTest(fields=list(payload)):
                response = self.client.patch(f'/api/posts/{post.id}/', {
                    'content': 'Changed', **payload,
                }, format='multipart')
                self.assertEqual(response.status_code, 400)
                post.refresh_from_db()
                self.assertEqual(post.content, 'Original')
                self.assertEqual(list(post.media.values_list('id', flat=True)), [original_media.id])
                self.assertTrue(default_storage.exists(original_media.file))

    def test_media_only_post_must_keep_or_replace_its_last_attachment(self):
        response = self.client.post(self.group_url, {'uploads': [self.image()]}, format='multipart')
        post_id = response.data['id']
        media_id = response.data['media'][0]['id']
        response = self.client.patch(f'/api/posts/{post_id}/', {
            'removedMedia': [media_id],
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertTrue(Media.objects.filter(pk=media_id).exists())
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(f'/api/posts/{post_id}/', {
                'removedMedia': [media_id], 'uploads': [self.video()],
            }, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['type'] for item in response.data['media']], ['video'])
        self.assertFalse(Media.objects.filter(pk=media_id).exists())

    def test_other_group_members_cannot_edit_attachments(self):
        response = self.client.post(self.group_url, {'uploads': [self.image()]}, format='multipart')
        post_id = response.data['id']
        media_id = response.data['media'][0]['id']
        self.client.force_authenticate(user=self.member)
        response = self.client.patch(f'/api/posts/{post_id}/', {
            'removedMedia': [media_id], 'uploads': [self.video()],
        }, format='multipart')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(list(Media.objects.values_list('id', flat=True)), [media_id])

    def test_failed_edit_keeps_original_media_and_cleans_up_new_files(self):
        from rest_framework.exceptions import APIException

        response = self.client.post(self.group_url, {
            'content': 'Original', 'uploads': [self.image()],
        }, format='multipart')
        post = Post.objects.get(pk=response.data['id'])
        original_media = post.media.get()
        saved_files = []

        def save_or_fail(upload, key):
            if saved_files:
                raise APIException('Could not upload your media.')
            saved_files.append(save_media_file(upload, key))
            return saved_files[-1]

        with patch('api.serializers.post.save_media_file', side_effect=save_or_fail):
            response = self.client.patch(f'/api/posts/{post.id}/', {
                'content': 'Changed', 'removedMedia': [original_media.id],
                'uploads': [self.image(), self.video()],
            }, format='multipart')
        self.assertEqual(response.status_code, 500)
        post.refresh_from_db()
        self.assertEqual(post.content, 'Original')
        self.assertEqual(list(post.media.values_list('id', flat=True)), [original_media.id])
        self.assertTrue(default_storage.exists(original_media.file))
        self.assertFalse(default_storage.exists(saved_files[0]))

    @override_settings(AWS_S3_BUCKET='media-test-bucket')
    def test_s3_uploads_return_signed_urls_and_delete_stored_objects(self):
        client = Mock()
        client.generate_presigned_url.return_value = 'https://example.com/signed-video.mp4'
        with patch('api.storage.get_s3_client', return_value=client), patch(
            'api.serializers.media.get_s3_client', return_value=client,
        ):
            response = self.client.post(self.group_url, {'uploads': [self.video()]}, format='multipart')
            self.assertEqual(response.status_code, 201)
            media = Media.objects.get()
            self.assertEqual(response.data['media'][0]['url'], 'https://example.com/signed-video.mp4')
            self.assertEqual(client.upload_fileobj.call_args.kwargs['ExtraArgs'], {'ContentType': 'video/mp4'})
            client.generate_presigned_url.assert_called_with(
                'get_object', Params={'Bucket': 'media-test-bucket', 'Key': media.file}, ExpiresIn=3600,
            )
            response_media = self.client.get(f'/api/media/{media.pk}/')
            self.assertEqual(response_media.status_code, 302)
            self.assertEqual(response_media['Location'], 'https://example.com/signed-video.mp4')
            with self.captureOnCommitCallbacks(execute=True):
                self.client.delete(f"/api/posts/{response.data['id']}/")
            client.delete_object.assert_called_once_with(Bucket='media-test-bucket', Key=media.file)


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
