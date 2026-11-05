import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateTimeFields } from '@/components/date-time-fields';
import { LoginButton } from '@/components/login-button';
import { ModalClose } from '@/components/modal-close';
import { ModalView } from '@/components/modal-view';
import { PostMedia } from '@/components/post-media';
import { TextInputThemed } from '@/components/text-input-themed';
import { WeatherMenu } from '@/components/weather-menu';
import { WhiteBox } from '@/components/white-box';
import { usePostMedia } from '@/hooks/use-post-media';
import { parsePostLink } from '@/lib/post-link';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export type CreatePostModalProps = {
  visibleBoolean: boolean;
  closeFunction: () => void;
  groupId: number;
  onCreated: (post: authApi.UserPost, isDraft: boolean) => void;
};

export function CreatePostModal({ visibleBoolean, closeFunction, groupId, onCreated }: CreatePostModalProps) {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [weather, setWeather] = useState('');
  const [postDate, setPostDate] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { media, setMedia, isPicking, mediaError, handlePickMedia } = usePostMedia();

  async function handleCreate(isDraft: boolean) {
    const trimmedContent = content.trim();
    const trimmedLink = link.trim();
    if (!token || !Number.isInteger(groupId) || groupId <= 0) {
      setError('This group could not be found.');
      return;
    }
    if (!isDraft && !trimmedContent && !trimmedLink && media.length === 0) {
      setError('Write a moment or add media or a link.');
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const createdPost = await authApi.createPost(
        token,
        groupId,
        { content: trimmedContent, createdAt: postDate.toISOString() },
        media,
        parsePostLink(trimmedLink),
        isDraft,
        weather,
      );
      onCreated(createdPost, isDraft);
      setContent('');
      setLink('');
      setWeather('');
      setMedia([]);
      setPostDate(new Date());
      closeFunction();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not create the post.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal visible={visibleBoolean} transparent animationType="fade" onRequestClose={closeFunction}>
      <ModalView style={styles.modal}>
        <ModalClose closeFunction={closeFunction} accessibilityLabel="Close create post" />
        <WhiteBox style={styles.formBox}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.formArea}>
            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>Create post</Text>
              <LoginButton
                text={isPicking ? 'Selecting…' : 'Upload images / video'}
                type="secondary"
                disabled={isSaving || isPicking}
                onPress={handlePickMedia}
                style={styles.smallButton}
                labelStyle={styles.smallButtonText}
              />
              {mediaError && <Text accessibilityRole="alert" style={styles.error}>{mediaError}</Text>}
              {media.length > 0 && (
                <PostMedia
                  compact
                  media={media.map((asset) => ({
                    id: asset.uri,
                    type: asset.type === 'video' ? 'video' as const : 'image' as const,
                    url: asset.uri,
                  }))}
                  onRemove={(id) => setMedia((current) => current.filter((asset) => asset.uri !== id))}
                />
              )}
              <Text style={styles.label}>Caption</Text>
              <TextInputThemed
                editable={!isSaving && !isPicking}
                maxLength={100}
                multiline
                onChangeText={setContent}
                placeholder="What's your moment?"
                style={styles.contentInput}
                textAlignVertical="top"
                value={content}
              />
              <Text style={styles.label}>Link</Text>
              <TextInputThemed
                accessibilityLabel="External link"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSaving && !isPicking}
                keyboardType="url"
                maxLength={2048}
                onChangeText={setLink}
                placeholder="https://example.com"
                value={link}
              />
              <View style={styles.section}>
                <Text style={styles.label}>Weather</Text>
                <WeatherMenu value={weather} onChange={setWeather} disabled={isSaving} />
              </View>
              <View style={styles.section}>
                <Text style={styles.label}>Post time</Text>
                <DateTimeFields value={postDate} onChange={setPostDate} />
              </View>
              {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            </ScrollView>
          </KeyboardAvoidingView>
          <View style={styles.actions}>
            <LoginButton
              text={isSaving ? 'Creating…' : 'Create post'}
              type="primary"
              disabled={isSaving || isPicking}
              onPress={() => handleCreate(false)}
              style={styles.actionButton}
              labelStyle={styles.actionLabel}
            />
            <LoginButton
              text={isSaving ? 'Saving…' : 'Save as draft'}
              type="secondary"
              disabled={isSaving || isPicking}
              onPress={() => handleCreate(true)}
              style={styles.actionButton}
              labelStyle={styles.actionLabel}
            />
          </View>
        </WhiteBox>
      </ModalView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  formBox: {
    width: '100%',
    maxWidth: 520,
    flex: 1,
    padding: 14,
    gap: 10,
  },
  formArea: {
    flex: 1,
  },
  form: {
    gap: 10,
    paddingBottom: 8,
  },
  title: {
    alignSelf: 'flex-start',
    color: Colors.heading,
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    color: Colors.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  contentInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  section: {
    gap: 7,
    zIndex: 10,
  },
  smallButton: {
    alignSelf: 'flex-start',
    width: 'auto',
    height: 42,
    paddingHorizontal: 12,
  },
  smallButtonText: {
    fontSize: 16,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  actionButton: {
    width: '100%',
    height: 48,
  },
  actionLabel: {
    fontSize: 18,
  },
  error: {
    color: '#9B2C2C',
    fontSize: 14,
  },
});
