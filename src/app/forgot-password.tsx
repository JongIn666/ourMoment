import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { LoginError, LoginHeader, LoginPanel } from '@/components/other-login-ui';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';
import * as authApi from '@/lib/auth-api';

export default function ForgotPassword() {
    const router = useRouter();

    const [identifier, setIdentifier] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmedIdentifier = identifier.trim();
    const canSubmit =
        !isSubmitting &&
        trimmedIdentifier.length > 0;

    function handleIdentifierChange(value: string) {
        setIdentifier(value);
        setError(null);
    }

    async function handleSubmit() {
        setError(null);

        if (!canSubmit) {
            setError('Fill out every field.');
            return;
        }

        setIsSubmitting(true);

        try {
            await authApi.checkResetIdentifier(trimmedIdentifier);
            router.push(`/reset-password?identifier=${encodeURIComponent(trimmedIdentifier)}`);
        } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : 'Unable to check account.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SafeAreaProvider>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                style={styles.keyboardView}
            >
                <SafeAreaViewThemed style={ styles.container }>
                    <BackButtonView/>

                    <LoginHeader text="Reset your password"/>

                    <LoginPanel>
                        <TextInputThemed
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={handleIdentifierChange}
                            placeholder="Username or email"
                            value={identifier}
                        />

                        {error && (
                            <LoginError>
                                {error}
                            </LoginError>
                        )}
                    </LoginPanel>

                    <LoginButton
                        text={isSubmitting ? 'Checking…' : 'Continue'}
                        type="primary"
                        disabled={!canSubmit}
                        onPress={handleSubmit}
                    />
                </SafeAreaViewThemed>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
       gap: 24,
       width: '100%'
    },
    keyboardView: {
        flex: 1,
        alignItems: 'center',
    }
});
