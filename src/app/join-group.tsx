import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { LoginError, LoginPanel } from '@/components/other-login-ui';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export default function JoinGroup() {
  const router = useRouter();
  const { token } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    if (!token || isJoining) return;
    const code = inviteCode.trim().toUpperCase();
    if (code.length !== 10) {
      setError('Enter a 10-character invite code.');
      return;
    }

    setError(null);
    setIsJoining(true);
    try {
      const group = await authApi.joinGroup(token, code);
      router.replace({ pathname: '/group', params: { groupId: String(group.id) } });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not join the group.');
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={styles.keyboardView}>
        <SafeAreaViewThemed style={styles.container}>
          <BackButtonView />
          <Text style={styles.heading}>Join from invite code</Text>

          <LoginPanel>
            <TextInputThemed
              accessibilityLabel="Invite code"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isJoining}
              onChangeText={setInviteCode}
              onSubmitEditing={handleJoin}
              placeholder="Invite code"
              returnKeyType="done"
              value={inviteCode}
            />
            {error && <LoginError>{error}</LoginError>}
          </LoginPanel>

          <LoginButton
            text={isJoining ? 'Joining…' : 'Join group'}
            type="primary"
            disabled={isJoining || !token}
            onPress={handleJoin}
          />
        </SafeAreaViewThemed>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  keyboardView: {
    flex: 1,
  },
  heading: {
    alignSelf: 'flex-start',
    color: Colors.heading,
    fontSize: 24,
  },
});
