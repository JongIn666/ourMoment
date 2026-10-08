import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

export default function CreateGroup() {
  const router = useRouter();
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{ title: string; message: string } | null>(null);

  async function handleCreate() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!token) {
      setErrorPopup({ title: 'Sign in required', message: 'Sign in before creating a group.' });
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
    if (trimmedDescription.length > 200) {
      setErrorPopup({ title: 'Description is too long', message: 'Description must be 200 characters or fewer.' });
      return;
    }

    setIsSaving(true);
    try {
      const createdGroup = await authApi.createGroup(token, {
        name: trimmedName,
        description: trimmedDescription,
      });
      router.replace({
        pathname: '/group',
        params: { groupId: String(createdGroup.id) },
      });
    } catch (caughtError) {
      setErrorPopup({
        title: 'Could not create group',
        message: caughtError instanceof Error ? caughtError.message : 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.screen}>
        <BackButtonView />
        <View style={styles.headingBlock}>
          <Text style={styles.eyebrow}>YOUR GROUPS</Text>
          <Text style={styles.title}>Create group</Text>
        </View>

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
                maxLength={200}
                onChangeText={setDescription}
                placeholder="What is this group about?"
                style={styles.descriptionInput}
                textAlignVertical="top"
                value={description}
              />
              <Text style={styles.characterCount}>{description.length}/200</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.actions}>
          <LoginButton
            text={isSaving ? 'Creating…' : 'Create group'}
            type="primary"
            disabled={isSaving}
            onPress={handleCreate}
          />
        </View>
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
  actions: {
    alignItems: 'center',
    paddingTop: 8,
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
});