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

const PASSWORD_MIN_LENGTH = 8;

function checkPassword(password: string, confirmPassword: string) {
    if (password.length === 0 || confirmPassword.length === 0) {
        return 'Enter your new password twice. Please try again.';
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters. Please try again.`;
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match. Please try again.';
    }
    return null;
}

export default function EditPassword() {
    const auth = useAuth();
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit() {
        if (!auth.token) return;

        const invalidReason = checkPassword(password, confirmPassword);

        setError(invalidReason);
        if (invalidReason) return;

        setIsSubmitting(true);

        try {
            await authApi.updatePassword(auth.token, password, confirmPassword);
            router.replace('/edit-password-success');
        } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : 'Unable to save your password.');
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
                <SafeAreaViewThemed style={styles.container}>
                    <BackButtonView/>

                    <Text style={styles.heading}>
                        Edit password
                    </Text>

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

                        {error && (
                            <LoginError>
                                {error}
                            </LoginError>
                        )}

                        <Text style={styles.hint}>
                            At least {PASSWORD_MIN_LENGTH} characters, different from your current password.
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
        gap: 24,
        width: '100%'
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
