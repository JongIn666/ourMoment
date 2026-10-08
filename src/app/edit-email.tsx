import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { LoginError, LoginPanel } from '@/components/other-login-ui';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

function validateEmail(email: string) {
  if (!email) return 'Enter an email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid email address.';
  }
  return null;
}

export default function EditEmail() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    if (!auth.token) {
      setError('Sign in to edit your email.');
      setIsLoading(false);
      return;
    }

    authApi.getProfile(auth.token)
      .then((profile) => {
        if (!isActive) return;
        setEmail(profile.email);
        setOriginalEmail(profile.email);
      })
      .catch((caughtError: unknown) => {
        if (isActive) {
          setError(caughtError instanceof Error ? caughtError.message : 'Could not load your email.');
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [auth.token]);

  async function handleSubmit() {
    if (!auth.token) return;
    const trimmedEmail = email.trim();
    const validationError = validateEmail(trimmedEmail);
    setError(validationError);
    if (validationError) return;

    if (trimmedEmail.toLowerCase() === originalEmail.toLowerCase()) {
      router.back();
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.updateEmail(auth.token, trimmedEmail);
      router.back();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update your email.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaViewThemed style={styles.loading}>
          <ActivityIndicator color={Colors.heading} />
        </SafeAreaViewThemed>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <SafeAreaViewThemed style={styles.container}>
          <BackButtonView />
          <Text style={styles.heading}>Edit email</Text>
          <LoginPanel>
            <TextInputThemed
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
            />
            {error && <LoginError accessibilityRole="alert">{error}</LoginError>}
            <Text style={styles.hint}>A welcome email will be sent to the new address.</Text>
          </LoginPanel>
          <LoginButton
            text={isSubmitting ? 'Saving…' : 'Save email'}
            type="primary"
            disabled={isSubmitting || !auth.token}
            onPress={handleSubmit}
          />
        </SafeAreaViewThemed>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    gap: 24,
  },
  loading: {
    justifyContent: 'center',
  },
  heading: {
    alignSelf: 'flex-start',
    color: Colors.heading,
    fontSize: 24,
  },
  hint: {
    alignSelf: 'flex-start',
    color: Colors.interface.text,
    fontSize: 14,
  },
});