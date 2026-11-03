import { useLocalSearchParams, useRouter } from 'expo-router';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
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
import * as authApi from '@/lib/auth-api';

export default function CreatePost() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [postDate, setPostDate] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePickMedia() {
    setIsPicking(true);
    setMediaError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setMediaError('Allow photo and video access to upload media.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (result.canceled) return;

      const selected = result.assets.filter((asset) => {
        const size = asset.fileSize ?? asset.file?.size ?? new File(asset.uri).size;
        if (size > 8 * 1024 * 1024) {
          setMediaError('Each image or video must be 8 MB or smaller.');
          return false;
        }
        return true;
      });
      setMedia((current) => [...current, ...selected.filter((asset) => (
        !current.some((item) => item.uri === asset.uri)
      ))]);
    } catch (caughtError) {
      setMediaError(caughtError instanceof Error ? caughtError.message : 'Could not select media.');
    } finally {
      setIsPicking(false);
    }
  }

  async function handleCreate() {
    const id = Number(groupId);
    const trimmedContent = content.trim();
    if (!token || !Number.isInteger(id) || id <= 0) {
      setError('This group could not be found.');
      return;
    }
    if (!trimmedContent && media.length === 0) {
      setError('Write a moment or add an image or video.');
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await authApi.createPost(token, id, {
        content: trimmedContent,
        createdAt: postDate.toISOString(),
      }, media);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace({ pathname: '/group', params: { groupId: String(id) } });
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not create the post.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.screen}>
        <BackButtonView />
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>NEW MOMENT</Text>
          <Text style={styles.title}>Create post</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.formArea}
        >
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <LoginButton
              text="Upload images / video"
              type="secondary"
              disabled={isSaving || isPicking}
              onPress={handlePickMedia}
              style={styles.uploadButton}
              labelStyle={styles.uploadLabel}
            />
            {mediaError && <Text accessibilityRole="alert" style={styles.error}>{mediaError}</Text>}
            {media.length > 0 && (
              <PostMedia
                compact
                media={media.map((asset) => ({
                  id: asset.uri,
                  type: asset.type === 'video' ? 'video' : 'image',
                  url: asset.uri,
                }))}
                onRemove={isSaving ? undefined : (id) => setMedia((current) => current.filter((asset) => asset.uri !== id))}
              />
            )}

            <TextInputThemed
              autoFocus
              multiline
              onChangeText={setContent}
              placeholder="Write a moment for this group"
              style={styles.contentInput}
              textAlignVertical="top"
              value={content}
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
            text={isSaving ? 'Creating…' : 'Create post'}
            type="primary"
            disabled={isSaving || isPicking}
            onPress={handleCreate}
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
    minHeight: 180,
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
