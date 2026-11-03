import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export default function EditGroup() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reactionEmojis, setReactionEmojis] = useState<string[]>([]);
  const [newReactionEmoji, setNewReactionEmoji] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    let isActive = true;
    const id = Number(groupId);
    if (!token || !Number.isInteger(id) || id <= 0) {
      setErrorPopup({ title: 'Group unavailable', message: 'This group could not be found.' });
      setIsLoading(false);
      return;
    }

    authApi.getGroup(token, id)
      .then((group) => {
        if (!isActive) return;
        setName(group.name);
        setDescription(group.description);
        setReactionEmojis(group.reactionEmojis);
      })
      .catch((caughtError: unknown) => {
        if (isActive) {
          setErrorPopup({
            title: 'Could not load group',
            message: caughtError instanceof Error ? caughtError.message : 'Please try again.',
          });
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [groupId, token]);

  async function handleSave() {
    const id = Number(groupId);
    const trimmedName = name.trim();
    if (!token || !Number.isInteger(id) || id <= 0) {
      setErrorPopup({ title: 'Group unavailable', message: 'This group could not be found.' });
      return;
    }
    if (!trimmedName) {
      setErrorPopup({ title: 'Name required', message: 'Enter a name for this group.' });
      return;
    }
    if (trimmedName.length > 50 || !/^[A-Za-z0-9 ]+$/.test(trimmedName)) {
      setErrorPopup({
        title: 'Invalid group name',
        message: 'Group names must be 1–50 characters and contain only letters, numbers, and spaces.',
      });
      return;
    }
    if (description.length > 200) {
      setErrorPopup({ title: 'Description is too long', message: 'Description must be 200 characters or fewer.' });
      return;
    }
    if (reactionEmojis.length === 0) {
      setErrorPopup({ title: 'Add a reaction emoji', message: 'A group must have at least one custom reaction emoji.' });
      return;
    }

    setIsSaving(true);
    try {
      await authApi.updateGroup(token, id, {
        name: trimmedName,
        description: description.trim(),
      });
      try {
        await authApi.updateGroupReactionEmojis(token, id, reactionEmojis);
      } catch (caughtError) {
        setErrorPopup({
          title: 'Group details saved, emojis not updated',
          message: caughtError instanceof Error ? caughtError.message : 'Please try saving the emojis again.',
        });
        return;
      }
      router.back();
    } catch (caughtError) {
      setErrorPopup({
        title: 'Could not save group',
        message: caughtError instanceof Error ? caughtError.message : 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  function addReactionEmoji() {
    const emoji = newReactionEmoji.trim();
    if (!emoji) return;
    if (reactionEmojis.includes(emoji)) {
      setErrorPopup({ title: 'Emoji already added', message: 'Choose a reaction emoji that is not already in this group.' });
      return;
    }
    if (reactionEmojis.length > 20) {
      setErrorPopup({ title: 'Reaction list is full', message: 'A group can have at most 20 custom reaction emojis.' });
      return;
    }
    setReactionEmojis((current) => [...current, emoji]);
    setNewReactionEmoji('');
  }

  function removeReactionEmoji(emoji: string) {
    if (reactionEmojis.length <= 1) {
      setErrorPopup({ title: 'Keep one reaction', message: 'A group must have at least one custom reaction emoji.' });
      return;
    }
    setReactionEmojis((current) => current.filter((item) => item !== emoji));
  }

  async function handleDelete() {
    const id = Number(groupId);
    if (!token || !Number.isInteger(id) || id <= 0) {
      setShowDeleteConfirmation(false);
      setErrorPopup({ title: 'Group unavailable', message: 'This group could not be found.' });
      return;
    }

    setIsDeleting(true);
    try {
      await authApi.deleteGroup(token, id);
      setShowDeleteConfirmation(false);
      router.dismissAll();
      router.replace('/home');
    } catch (caughtError) {
      setShowDeleteConfirmation(false);
      setErrorPopup({
        title: 'Could not delete group',
        message: caughtError instanceof Error ? caughtError.message : 'Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleLeave() {
    const id = Number(groupId);
    if (!token || !Number.isInteger(id) || id <= 0) {
      setShowLeaveConfirmation(false);
      setErrorPopup({ title: 'Group unavailable', message: 'This group could not be found.' });
      return;
    }

    setIsLeaving(true);
    try {
      await authApi.leaveGroup(token, id);
      setShowLeaveConfirmation(false);
      router.dismissAll();
      router.replace('/home');
    } catch (caughtError) {
      setShowLeaveConfirmation(false);
      setErrorPopup({
        title: 'Could not leave group',
        message: caughtError instanceof Error ? caughtError.message : 'Please try again.',
      });
    } finally {
      setIsLeaving(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.screen}>
        <BackButtonView />
        <View style={styles.headingBlock}>
          <Text style={styles.eyebrow}>GROUP SETTINGS</Text>
          <Text style={styles.title}>Edit group</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.heading} />
        ) : (
          <>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.formArea}
            >
              <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
                <View style={styles.field}>
                  <Text style={styles.label}>Group name</Text>
                  <TextInputThemed
                    autoCapitalize="words"
                    maxLength={50}
                    onChangeText={setName}
                    placeholder="Name your group"
                    value={name}
                  />
                  <Text style={styles.characterCount}>{name.length}/50</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Description</Text>
                  <TextInputThemed
                    multiline
                    onChangeText={setDescription}
                    maxLength={200}
                    placeholder="What is this group about?"
                    style={styles.descriptionInput}
                    textAlignVertical="top"
                    value={description}
                  />
                  <Text style={styles.characterCount}>{description.length}/200</Text>
                </View>

                <View style={styles.reactionSection}>
                  <View style={styles.reactionHeading}>
                    <Text style={styles.label}>Custom reactions</Text>
                    <Text style={styles.characterCount}>{reactionEmojis.length}/20</Text>
                  </View>
                  <View style={styles.reactionList}>
                    {reactionEmojis.map((emoji, index) => (
                      <View key={`${emoji}-${index}`} style={styles.reactionChip}>
                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${emoji}`}
                          hitSlop={6}
                          onPress={() => removeReactionEmoji(emoji)}
                          style={styles.removeEmojiButton}
                        >
                          <Text style={styles.removeEmojiText}>×</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                  <View style={styles.addEmojiRow}>
                    <TextInputThemed
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={16}
                      onChangeText={setNewReactionEmoji}
                      onSubmitEditing={addReactionEmoji}
                      placeholder="Type an emoji"
                      returnKeyType="done"
                      style={styles.emojiInput}
                      value={newReactionEmoji}
                    />
                    <Pressable
                      accessibilityRole="button"
                      disabled={reactionEmojis.length >= 20 || !newReactionEmoji.trim()}
                      onPress={addReactionEmoji}
                      style={[
                        styles.addEmojiButton,
                        (reactionEmojis.length >= 20 || !newReactionEmoji.trim()) && styles.disabledButton,
                      ]}
                    >
                      <Text style={styles.addEmojiText}>Add</Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.actions}>
              <LoginButton
                text={isSaving ? 'Saving…' : 'Save changes'}
                type="primary"
                disabled={isSaving || isDeleting || isLeaving}
                onPress={handleSave}
              />
              <Pressable
                accessibilityRole="button"
                disabled={isSaving || isDeleting || isLeaving}
                onPress={() => setShowDeleteConfirmation(true)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>
                  {isDeleting ? 'Deleting…' : 'Delete group'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSaving || isDeleting || isLeaving}
                onPress={() => setShowLeaveConfirmation(true)}
                style={styles.leaveButton}
              >
                <Text style={styles.deleteButtonText}>
                  {isLeaving ? 'Leaving…' : 'Leave group'}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </SafeAreaViewThemed>

      <Modal
        animationType="fade"
        onRequestClose={() => setErrorPopup(null)}
        transparent
        visible={errorPopup !== null}
      >
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.errorDialog}>
            <Text accessibilityRole="header" style={styles.errorTitle}>{errorPopup?.title}</Text>
            <Text style={styles.errorMessage}>{errorPopup?.message}</Text>
            <Pressable onPress={() => setErrorPopup(null)} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setShowDeleteConfirmation(false);
        }}
        transparent
        visible={showDeleteConfirmation}
      >
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.errorDialog}>
            <Text accessibilityRole="header" style={styles.errorTitle}>Delete this group?</Text>
            <Text style={styles.errorMessage}>
              “{name}” and its membership will be permanently deleted. This action cannot be undone.
            </Text>
            <View style={styles.confirmationActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                onPress={() => setShowDeleteConfirmation(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                onPress={handleDelete}
                style={styles.confirmDeleteButton}
              >
                <Text style={styles.confirmDeleteButtonText}>
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!isLeaving) setShowLeaveConfirmation(false);
        }}
        transparent
        visible={showLeaveConfirmation}
      >
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.errorDialog}>
            <Text accessibilityRole="header" style={styles.errorTitle}>Leave this group?</Text>
            <Text style={styles.errorMessage}>
              You will leave “{name}” and lose access to its posts and members.
            </Text>
            <View style={styles.confirmationActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isLeaving}
                onPress={() => setShowLeaveConfirmation(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isLeaving}
                onPress={handleLeave}
                style={styles.confirmDeleteButton}
              >
                <Text style={styles.confirmDeleteButtonText}>
                  {isLeaving ? 'Leaving…' : 'Leave group'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'stretch',
    gap: 8,
  },
  headingBlock: {
    gap: 2,
    paddingBottom: 6,
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
    gap: 18,
    paddingBottom: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    color: Colors.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionInput: {
    minHeight: 120,
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: Colors.interface.text,
    fontSize: 12,
  },
  reactionSection: {
    gap: 10,
  },
  reactionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingLeft: 10,
    paddingRight: 7,
    borderWidth: 1,
    borderColor: Colors.box.border,
    backgroundColor: Colors.box.background,
  },
  reactionEmoji: {
    fontSize: 21,
  },
  removeEmojiButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 25,
    height: 25,
  },
  removeEmojiText: {
    color: Colors.interface.text,
    fontSize: 21,
  },
  addEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emojiInput: {
    flex: 1,
  },
  addEmojiButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.button.primary.border,
    backgroundColor: Colors.button.primary.color,
  },
  addEmojiText: {
    color: Colors.button.primary.label,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  actions: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  deleteButton: {
    minHeight: 48,
    minWidth: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#A12E2E',
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: '#A12E2E',
    fontSize: 16,
    fontWeight: '700',
  },
  leaveButton: {
    minHeight: 48,
    minWidth: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#A12E2E',
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    opacity: 0.8,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  errorDialog: {
    alignSelf: 'stretch',
    maxWidth: 420,
    padding: 22,
    gap: 12,
    backgroundColor: Colors.box.background,
    borderColor: Colors.box.border,
    borderWidth: 1,
  },
  errorTitle: {
    color: Colors.heading,
    fontSize: 20,
    fontWeight: '700',
  },
  errorMessage: {
    color: Colors.interface.text,
    fontSize: 16,
    lineHeight: 23,
  },
  errorButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.button.primary.color,
    borderColor: Colors.button.primary.border,
    borderWidth: 1,
  },
  errorButtonText: {
    color: Colors.button.primary.label,
    fontSize: 16,
    fontWeight: '700',
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: Colors.interface.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: '#A12E2E',
    paddingHorizontal: 16,
  },
  confirmDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
