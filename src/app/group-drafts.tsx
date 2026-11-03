import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { BackButtonView } from '@/components/back-button-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function GroupDrafts() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const { token } = useAuth();
  const [drafts, setDrafts] = useState<authApi.UserPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftToDelete, setDraftToDelete] = useState<authApi.UserPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const id = Number(groupId);
      if (!token || !Number.isInteger(id) || id <= 0) {
        setError('This group could not be found.');
        setIsLoading(false);
        return () => {
          isActive = false;
        };
      }

      setIsLoading(true);
      setError(null);
      authApi.getGroupDrafts(token, id)
        .then((groupDrafts) => {
          if (isActive) setDrafts(groupDrafts);
        })
        .catch((caughtError: unknown) => {
          if (isActive) {
            setError(caughtError instanceof Error ? caughtError.message : 'Could not load drafts.');
          }
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [groupId, token]),
  );

  const id = Number(groupId);

  async function deleteDraft() {
    if (!token || !draftToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await authApi.deletePost(token, draftToDelete.id);
      setDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== draftToDelete.id));
      setDraftToDelete(null);
    } catch (caughtError) {
      setDeleteError(caughtError instanceof Error ? caughtError.message : 'Could not delete this draft.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.screen}>
        <BackButtonView />
        <Text style={styles.heading}>Group drafts</Text>
        {isLoading ? (
          <View style={styles.state}>
            <ActivityIndicator color={Colors.heading} />
          </View>
        ) : error ? (
          <Text style={styles.message}>{error}</Text>
        ) : drafts.length === 0 ? (
          <Text style={styles.message}>No drafts for this group yet.</Text>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
            {drafts.map((draft) => (
              <View key={draft.id} style={styles.draftCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open draft"
                  onPress={() => router.push({
                    pathname: '/create-post',
                    params: { groupId: String(id), draftId: String(draft.id) },
                  })}
                  style={styles.draftBody}
                >
                  <Text numberOfLines={2} style={styles.draftContent}>
                    {draft.content.trim() || draft.link || 'Untitled draft'}
                  </Text>
                  <Text style={styles.draftDetails}>
                    {new Date(draft.createdAt).toLocaleString()} · {draft.media.length} attachment{draft.media.length === 1 ? '' : 's'}
                  </Text>
                </Pressable>
                <View style={styles.draftActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Delete draft"
                    onPress={() => {
                      setDeleteError(null);
                      setDraftToDelete(draft);
                    }}
                    style={styles.actionButton}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        <Modal
          animationType="fade"
          transparent
          visible={draftToDelete !== null}
          onRequestClose={() => !isDeleting && setDraftToDelete(null)}
        >
          <View style={styles.confirmationOverlay}>
            <View accessibilityRole="alert" style={styles.confirmationDialog}>
              <Text style={styles.confirmationTitle}>Delete this draft?</Text>
              <Text style={styles.message}>This draft will be permanently deleted.</Text>
              {deleteError && <Text accessibilityRole="alert" style={styles.deleteError}>{deleteError}</Text>}
              <View style={styles.confirmationActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isDeleting}
                  onPress={() => setDraftToDelete(null)}
                  style={styles.actionButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={isDeleting}
                  onPress={deleteDraft}
                  style={styles.confirmDeleteButton}
                >
                  <Text style={styles.confirmDeleteText}>{isDeleting ? 'Deleting…' : 'Delete'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaViewThemed>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'stretch',
    gap: 14,
  },
  heading: {
    color: Colors.heading,
    fontSize: 26,
    fontWeight: '700',
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  draftCard: {
    borderWidth: 2,
    borderColor: Colors.box.border,
    backgroundColor: Colors.box.background,
  },
  draftBody: {
    gap: 8,
    padding: 14,
  },
  draftActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteText: {
    color: '#9B2C2C',
    fontSize: 13,
    fontWeight: '700',
  },
  confirmationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  confirmationDialog: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    padding: 22,
    borderRadius: 12,
    backgroundColor: Colors.box.background,
  },
  confirmationTitle: {
    color: Colors.heading,
    fontSize: 20,
    fontWeight: '700',
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  cancelText: {
    color: Colors.interface.text,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#9B2C2C',
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deleteError: {
    color: '#9B2C2C',
    fontSize: 14,
  },
  draftContent: {
    color: Colors.interface.text,
    fontSize: 16,
    fontWeight: '600',
  },
  draftDetails: {
    color: Colors.label,
    fontSize: 12,
  },
  state: {
    paddingVertical: 20,
  },
  message: {
    color: Colors.interface.text,
    paddingVertical: 12,
  },
});
