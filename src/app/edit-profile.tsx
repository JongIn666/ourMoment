import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
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

export default function EditProfile() {
  const router = useRouter();
  const { token } = useAuth();
  const [profile, setProfile] = useState<authApi.Profile | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    let isActive = true;
    if (!token) {
      setErrorPopup({ title: 'Unable to load profile', message: 'Sign in to edit your profile.' });
      setIsLoading(false);
      return;
    }

    authApi.getProfile(token)
      .then((currentProfile) => {
        if (!isActive) return;
        setProfile(currentProfile);
        setEmail(currentProfile.email ?? '');
      })
      .catch((caughtError: unknown) => {
        if (isActive) {
          setErrorPopup({
            title: 'Unable to load profile',
            message: caughtError instanceof Error ? caughtError.message : 'Could not load your profile.',
          });
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  async function handleSave() {
    if (!token || !profile) return;

    const username = profile.username.trim();
    const displayName = profile.displayName.trim();
    if (!/^[A-Za-z0-9]+$/.test(username)) {
      setErrorPopup({ title: 'Invalid username', message: 'Username can contain only letters and numbers.' });
      return;
    }
    if (displayName && !/^[A-Za-z0-9 ]+$/.test(displayName)) {
      setErrorPopup({
        title: 'Invalid display name',
        message: 'Display name can contain only letters, numbers, and spaces.',
      });
      return;
    }
    if (profile.bio.length > 200) {
      setErrorPopup({ title: 'Bio is too long', message: 'Bio must be 200 characters or fewer.' });
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile = await authApi.updateProfile(token, {
        username,
        displayName,
        birthday: profile.birthday?.trim() || null,
        showAge: profile.showAge,
        showBirthday: profile.showBirthday,
        bio: profile.bio.trim(),
      });
      setProfile(updatedProfile);

      const updatedEmail = email.trim();
      if (updatedEmail !== profile.email) {
        try {
          await authApi.updateEmail(token, updatedEmail);
        } catch (caughtError) {
          setErrorPopup({
            title: 'Profile saved, email not changed',
            message: `Email update failed: ${caughtError instanceof Error ? caughtError.message : 'Please try again.'}`,
          });
          return;
        }
      }

      router.back();
    } catch (caughtError) {
      setErrorPopup({
        title: 'Unable to save profile',
        message: caughtError instanceof Error ? caughtError.message : 'Could not save your profile.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  function updateProfileField<K extends keyof authApi.Profile>(key: K, value: authApi.Profile[K]) {
    setProfile((current) => current ? { ...current, [key]: value } : current);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.screen}>
        <BackButtonView />
        <View style={styles.headingBlock}>
          <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
          <Text style={styles.title}>Edit profile</Text>
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
                <Field label="Display name">
                  <TextInputThemed
                    autoCapitalize="words"
                    onChangeText={(value) => updateProfileField('displayName', value)}
                    placeholder="How should people see you?"
                    value={profile?.displayName ?? ''}
                  />
                </Field>

                <Field label="Username" hint="Letters and numbers only">
                  <TextInputThemed
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={(value) => updateProfileField('username', value)}
                    placeholder="Your username"
                    value={profile?.username ?? ''}
                  />
                </Field>

                <Field label="Email address">
                  <TextInputThemed
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    value={email}
                  />
                </Field>

                <Field label="Birthday" hint="Use YYYY-MM-DD">
                  <TextInputThemed
                    autoCapitalize="none"
                    keyboardType="numbers-and-punctuation"
                    onChangeText={(value) => updateProfileField('birthday', value || null)}
                    placeholder="YYYY-MM-DD"
                    value={profile?.birthday ?? ''}
                  />
                </Field>

                <Field label="Bio">
                  <TextInputThemed
                    multiline
                    onChangeText={(value) => updateProfileField('bio', value)}
                    maxLength={200}
                    placeholder="A few words about you"
                    style={styles.bioInput}
                    textAlignVertical="top"
                    value={profile?.bio ?? ''}
                  />
                  <Text style={styles.characterCount}>{profile?.bio.length ?? 0}/200</Text>
                </Field>

                <View style={styles.preferences}>
                  <Text style={styles.sectionTitle}>Birthday privacy</Text>
                  <PreferenceRow
                    label="Show my age"
                    value={profile?.showAge ?? false}
                    onValueChange={(value) => updateProfileField('showAge', value)}
                  />
                  <PreferenceRow
                    label="Show my birthday"
                    value={profile?.showBirthday ?? false}
                    onValueChange={(value) => updateProfileField('showBirthday', value)}
                  />
                </View>

              </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.actions}>
              <LoginButton
                text={isSaving ? 'Saving…' : 'Save changes'}
                type="primary"
                disabled={isSaving || !profile}
                onPress={handleSave}
              />
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
            <Text accessibilityRole="header" style={styles.errorTitle}>
              {errorPopup?.title}
            </Text>
            <Text style={styles.errorMessage}>{errorPopup?.message}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setErrorPopup(null)}
              style={styles.errorButton}
            >
              <Text style={styles.errorButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}

function PreferenceRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.preferenceRow}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.interface.box, true: Colors.button.primary.color }}
        value={value}
      />
    </View>
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
    gap: 16,
    paddingBottom: 18,
  },
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    color: Colors.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    color: Colors.interface.text,
    fontSize: 12,
  },
  bioInput: {
    minHeight: 104,
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: Colors.interface.text,
    fontSize: 12,
  },
  preferences: {
    borderTopWidth: 1,
    borderTopColor: Colors.box.border,
    paddingTop: 12,
    gap: 4,
  },
  sectionTitle: {
    color: Colors.heading,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
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
  preferenceRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceLabel: {
    color: Colors.interface.text,
    fontSize: 16,
  },
  actions: {
    alignItems: 'center',
    paddingTop: 8,
  },
});