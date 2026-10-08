import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { LoginError, LoginHeader, LoginPanel } from '@/components/other-login-ui';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';
import * as authApi from '@/lib/auth-api';

export default function ResetPassword() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const identifier = typeof params.identifier === 'string' ? params.identifier : '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordMismatch =
        password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;
    const canSubmit =
        !isSubmitting &&
        identifier.length > 0 &&
        password.length > 0 &&
        confirmPassword.length > 0 &&
        !passwordMismatch;
    const displayedError = error ?? (passwordMismatch ? 'Passwords do not match.' : null);

    useEffect(() => {
        if (!identifier) {
            router.replace('/forgot-password');
        }
    }, [identifier, router]);

    async function handleSubmit() {
        setError(null);

        if (!canSubmit) {
            setError('Fill out every field.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            await authApi.resetPassword(identifier, password, confirmPassword);
            router.replace('/login');
        } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : 'Unable to reset password.');
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

                    <LoginHeader text="Create new password"/>

                    <LoginPanel>
                        <TextInputThemed
                            autoCapitalize="none"
                            autoComplete="password"
                            autoFocus={true}
                            onChangeText={setPassword}
                            placeholder="New password"
                            secureTextEntry={true}
                            value={password}
                        />

                        <TextInputThemed
                            autoCapitalize="none"
                            autoComplete="password"
                            onChangeText={setConfirmPassword}
                            placeholder="Re-enter password"
                            secureTextEntry={true}
                            value={confirmPassword}
                        />

                        {displayedError && (
                            <LoginError>
                                {displayedError}
                            </LoginError>
                        )}
                    </LoginPanel>

                    <LoginButton
                        text={isSubmitting ? 'Saving…' : 'Save password'}
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
