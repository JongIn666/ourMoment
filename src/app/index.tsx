import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';

type AuthMode = 'login' | 'register';

export default function HomeScreen() {
  const auth = useAuth();
  const theme = useTheme();
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegistering = mode === 'register';
  const trimmedIdentifier = identifier.trim();
  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim();
  const trimmedDisplayName = displayName.trim();
  const passwordMismatch =
    isRegistering && password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;
  const isLoginComplete = trimmedIdentifier.length > 0 && password.length > 0;
  const isRegisterComplete =
    trimmedUsername.length > 0 &&
    trimmedEmail.length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;
  const canSubmit =
    !isSubmitting &&
    !passwordMismatch &&
    (isRegistering ? isRegisterComplete : isLoginComplete);
  const displayedError = error ?? (passwordMismatch ? 'Passwords do not match.' : null);
  const activeModeStyle = { borderColor: theme.text };
  const inputStyle = [
    styles.input,
    {
      borderColor: theme.text,
      color: theme.text,
    },
  ];

  async function handleSubmit() {
    setError(null);

    if (!canSubmit) {
      setError('Fill out every field.');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await auth.signUp(
          trimmedUsername,
          trimmedEmail,
          password,
          confirmPassword,
          trimmedDisplayName,
        );
      } else {
        await auth.signIn(trimmedIdentifier, password);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (auth.isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (auth.user) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.panel}>
            <ThemedText type="subtitle">Hi, {auth.user.username}</ThemedText>
            <Pressable style={styles.secondaryButton} onPress={auth.signOut}>
              <ThemedText type="smallBold">Log out</ThemedText>
            </Pressable>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.panel}>
            <ThemedView style={styles.modeSwitch}>
              <Pressable
                accessibilityRole="button"
                style={[styles.modeButton, !isRegistering && activeModeStyle]}
                onPress={() => setMode('login')}>
                <ThemedText type="smallBold">Login</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={[styles.modeButton, isRegistering && activeModeStyle]}
                onPress={() => setMode('register')}>
                <ThemedText type="smallBold">Create</ThemedText>
              </Pressable>
            </ThemedView>

            {isRegistering ? (
              <>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor={theme.textSecondary}
                  style={inputStyle}
                  value={username}
                />
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={theme.textSecondary}
                  style={inputStyle}
                  value={email}
                />
                <TextInput
                  autoCapitalize="words"
                  onChangeText={setDisplayName}
                  placeholder="Display name"
                  placeholderTextColor={theme.textSecondary}
                  style={inputStyle}
                  value={displayName}
                />
              </>
            ) : (
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setIdentifier}
                placeholder="Username or email"
                placeholderTextColor={theme.textSecondary}
                style={inputStyle}
                value={identifier}
              />
            )}

            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              style={inputStyle}
              value={password}
            />

            {isRegistering && (
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                style={inputStyle}
                value={confirmPassword}
              />
            )}

            {displayedError && (
              <ThemedText type="small" style={styles.error}>
                {displayedError}
              </ThemedText>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                { opacity: pressed || !canSubmit ? 0.5 : 1 },
              ]}>
              {isSubmitting ? (
                <ActivityIndicator />
              ) : (
                <ThemedText type="smallBold">{isRegistering ? 'Create account' : 'Login'}</ThemedText>
              )}
            </Pressable>
          </ThemedView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  hero: {
    gap: Spacing.two,
  },
  panel: {
    gap: Spacing.three,
  },
  modeSwitch: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modeButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  error: {
    color: '#C62828',
  },
});
