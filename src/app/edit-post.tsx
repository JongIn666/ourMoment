import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { DateTimeFields } from '@/components/date-time-fields';
import { LoginButton } from '@/components/login-button';
import { PostMedia } from '@/components/post-media';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { usePostMedia } from '@/hooks/use-post-media';
import * as authApi from '@/lib/auth-api';
import { parsePostLink } from '@/lib/post-link';

export default function EditPost() {
  const router = useRouter();
  const { postId, content: initialContent, createdAt } = useLocalSearchParams<{
    postId?: string;
    content?: string;
    createdAt?: string;
  }>();
  const { token } = useAuth();
  const { media, setMedia, isPicking, mediaError, handlePickMedia } = usePostMedia();
  const [loadedPost, setPost] = useState<authApi.UserPost | null>(null);
  const [removedMedia, setRemovedMedia] = useState<number[]>([]);
  const [content, setContent] = useState(initialContent ?? '');
  const [link, setLink] = useState('');
  const [postDate, setPostDate] = useState(() => {
    const parsedDate = createdAt ? new Date(createdAt) : null;
    return parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date();
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const post = loadedPost?.id === Number(postId) ? loadedPost : null;

  useEffect(() => {
    let isActive = true;
    if (!token) return;

    authApi.getPost(token, Number(postId))
      .then((currentPost) => {
        if (isActive) {
          setPost(currentPost);
          setContent(currentPost.content);
          setLink(currentPost.link);
          setPostDate(new Date(currentPost.createdAt));
          setMedia([]);
          setRemovedMedia([]);
          setError(null);
        }
      })
      .catch((caughtError: unknown) => {
        if (isActive) {
          setError(caughtError instanceof Error ? caughtError.message : 'Could not load the post.');
        }
      });

    return () => {
      isActive = false;
    };
  }, [postId, token, setMedia]);

  const attachments = [
    ...(post?.media ?? []).filter((item) => !removedMedia.includes(item.id)),
    ...media.map((asset) => ({
      id: asset.uri,
      type: asset.type === 'video' ? 'video' as const : 'image' as const,
      url: asset.uri,
    })),
  ];

  async function handleSave() {
    const trimmedContent = content.trim();
    const trimmedLink = link.trim();
    if (!token || !post || isSaving || isPicking) {
      setError('This post could not be found.');
      return;
    }
    if (!trimmedContent && !trimmedLink && attachments.length === 0) {
      setError('Write a moment or add media or a link.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const postLink = parsePostLink(trimmedLink);
      await authApi.updatePost(token, post.id, trimmedContent, postDate.toISOString(), media, removedMedia, postLink);
      if (router.canGoBack()) {
        router.back();
      } else if (post.group) {
        router.replace({ pathname: '/group', params: { groupId: String(post.group) } });
      } else {
        router.replace('/profile');
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not update the post.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.screen}>
        <BackButtonView />
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>YOUR MOMENT</Text>
          <Text style={styles.title}>Edit post</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.formArea}
        >
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <LoginButton
              text="Upload images / video"
              type="secondary"
              disabled={!post || isSaving || isPicking}
              onPress={handlePickMedia}
              style={styles.uploadButton}
              labelStyle={styles.uploadLabel}
            />
            {!post && !error && <ActivityIndicator color={Colors.heading} />}
            {mediaError && <Text accessibilityRole="alert" style={styles.error}>{mediaError}</Text>}
            {attachments.length > 0 && (
              <PostMedia
                compact
                media={attachments}
                onRemove={isSaving || isPicking ? undefined : (id) => {
                  if (typeof id === 'number') {
                    setRemovedMedia((current) => [...current, id]);
                  } else {
                    setMedia((current) => current.filter((asset) => asset.uri !== id));
                  }
                }}
              />
            )}

            <Text style={styles.label}>caption</Text>
            <TextInputThemed
              autoFocus
              editable={!!post && !isSaving}
              maxLength={100}
              multiline
              onChangeText={setContent}
              placeholder="Write a moment for this group"
              style={styles.contentInput}
              textAlignVertical="top"
              value={content}
            />
            <Text style={styles.label}>link</Text>
            <TextInputThemed
              accessibilityLabel="External link"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!!post && !isSaving && !isPicking}
              keyboardType="url"
              maxLength={2048}
              onChangeText={setLink}
              placeholder="https://example.com"
              returnKeyType="done"
              value={link}
            />

            <View style={styles.dateTimeSection}>
              <Text style={styles.label}>Post time</Text>
              <DateTimeFields value={postDate} onChange={setPostDate} />
            </View>

            {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.actions}>
          <LoginButton
            text={isSaving ? 'Saving…' : 'Save changes'}
            type="primary"
            disabled={!post || isSaving || isPicking}
            onPress={handleSave}
          />
        </View>
      </SafeAreaViewThemed>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'stretch',
    gap: 10,
  },
  heading: {
    gap: 2,
    paddingBottom: 8,
  },
  eyebrow: {
    color: Colors.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: Colors.heading,
    fontSize: 28,
    fontWeight: '700',
  },
  formArea: {
    flex: 1,
  },
  form: {
    gap: 12,
    paddingBottom: 20,
  },
  label: {
    color: Colors.heading,
    fontSize: 16,
    fontWeight: '600',
  },
  contentInput: {
    height: 60,
  },
  uploadButton: {
    alignSelf: 'flex-start',
    width: 'auto',
    height: 44,
    paddingHorizontal: 12,
  },
  uploadLabel: {
    fontSize: 16,
  },
  dateTimeSection: {
    gap: 10,
    marginTop: 6,
  },
  error: {
    color: '#9B2C2C',
    fontSize: 14,
  },
  actions: {
    alignItems: 'center',
    paddingTop: 8,
  },
});
