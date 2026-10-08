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

const USERNAME_MAX_LENGTH = 20;

function checkUsername(username: string) {
    if (username.length === 0) {
        return 'Enter a username. Please try again.';
    }
    if (username.length > USERNAME_MAX_LENGTH) {
        return `Username must be ${USERNAME_MAX_LENGTH} characters or fewer. Please try again.`;
    }
    if (!/^[A-Za-z0-9]+$/.test(username)) {
        return 'Username can contain only letters and numbers. Please try again.';
    }
    return null;
}

export default function EditUsername() {
    const auth = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        if (!auth.token) {
            setIsLoading(false);
            return;
        }

        authApi.getProfile(auth.token)
            .then((profile) => {
                if (isActive) setUsername(profile.username);
            })
            .catch(() => {
                if (isActive && auth.user) setUsername(auth.user.username);
            })
            .finally(() => {
                if (isActive) setIsLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [auth.token, auth.user]);

    async function handleSubmit() {
        if (!auth.token) return;

        const trimmedUsername = username.trim();
        const invalidReason = checkUsername(trimmedUsername);

        setError(invalidReason);
        if (invalidReason) return;

        setIsSubmitting(true);

        try {
            await authApi.updateUsername(auth.token, trimmedUsername);
            router.back();
        } catch (caughtError) {
            setError(
                `${caughtError instanceof Error ? caughtError.message : 'Unable to save your username.'} Please try again.`,
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <SafeAreaProvider>
                <SafeAreaViewThemed>
                    <ActivityIndicator color={Colors.heading} />
                </SafeAreaViewThemed>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                style={styles.keyboardView}
            >
                <SafeAreaViewThemed style={styles.container}>
                    <BackButtonView/>

                    <Text style={styles.heading}>
                        Edit username
                    </Text>

                    <LoginPanel>
                        <TextInputThemed
                            autoCapitalize="none"
                            autoCorrect={false}
                            maxLength={USERNAME_MAX_LENGTH}
                            onChangeText={setUsername}
                            placeholder="Your username"
                            value={username}
                        />

                        {error && (
                            <LoginError>
                                {error}
                            </LoginError>
                        )}

                        <Text style={styles.hint}>
                            Letters and numbers only, up to {USERNAME_MAX_LENGTH} characters.
                        </Text>
                    </LoginPanel>

                    <LoginButton
                        text={isSubmitting ? 'Saving…' : 'Save'}
                        type="primary"
                        disabled={isSubmitting || !auth.token}
                        onPress={handleSubmit}
                    />
                </SafeAreaViewThemed>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 24
    },
    keyboardView: {
        flex: 1,
        alignItems: 'center'
    },
    heading: {
        alignSelf: 'flex-start',
        color: Colors.heading,
        fontSize: 24
    },
    hint: {
        alignSelf: 'flex-start',
        color: Colors.interface.text,
        fontSize: 14
    }
});
