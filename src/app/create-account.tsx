import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { LoginError, LoginHeader, LoginPanel } from '@/components/other-login-ui';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';

export default function CreateAccount() {
    const auth = useAuth();
    const router = useRouter(); 

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const passwordMismatch =
        password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;
    const isRegisterComplete =
        trimmedUsername.length > 0 &&
        trimmedEmail.length > 0 &&
        password.length > 0 &&
        confirmPassword.length > 0;
    const canSubmit =
        !isSubmitting &&
        !passwordMismatch &&
        isRegisterComplete;
    const displayedError = error ?? (passwordMismatch ? 'Passwords do not match.' : null);

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
            await auth.signUp(
                trimmedUsername,
                trimmedEmail,
                password,
                confirmPassword,
                "Sonic the Hedgehog" // lol
            );
            router.navigate('/home');
        } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : 'Unable to sign in.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (auth.isLoading) {
        return (
            <SafeAreaProvider>
                <SafeAreaViewThemed>
                    <ActivityIndicator />
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
                <SafeAreaViewThemed style={ styles.container }>
                    <BackButtonView/>

                    <LoginHeader text="Let's start creating your moments!"/>

                    <LoginPanel>
                        <TextInputThemed
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect={false}
                            keyboardType="email-address"
                            onChangeText={setEmail}
                            placeholder="Email address"
                            value={email}
                        />
                        <TextInputThemed
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={setUsername}
                            placeholder="Username"
                            value={username}
                        />
                        <TextInputThemed
                            autoCapitalize="none"
                            autoComplete="password"
                            onChangeText={setPassword}
                            placeholder="Password"
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
                        text="Create account"
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
       gap: 24 
    },
    keyboardView: {
        flex: 1,
        alignItems: 'center',
    }
});