import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { LoginHeader, LoginPanel } from '@/components/other-login-ui';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';
import { Colors } from '@/constants/theme';

export default function LogIn() {
    const auth = useAuth();
    const router = useRouter(); 

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmedIdentifier = identifier.trim();
    const isLoginComplete = trimmedIdentifier.length > 0 && password.length > 0;
    const canSubmit =
        !isSubmitting &&
        isLoginComplete;
    const displayedError = error;

    async function handleSubmit() {
        setError(null);

        if (!canSubmit) {
            setError('Fill out every field.');
            return;
        }

        setIsSubmitting(true);

        try {
            await auth.signIn(trimmedIdentifier, password);
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

                    <LoginHeader text="Welcome back to your moment!"/>

                    <LoginPanel>
                        <TextInputThemed
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={setIdentifier}
                            placeholder="Username or email"
                            value={identifier}
                        />

                        <TextInputThemed
                            autoCapitalize="none"
                            autoComplete="password"
                            onChangeText={setPassword}
                            placeholder="Password"
                            secureTextEntry={true}
                            value={password}
                        />

                        {displayedError && (
                            <Text>
                                {displayedError}
                            </Text>
                        )}

                        <Link style={ styles.forgotLink } href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Forgot password?</Link>
                    </LoginPanel>

                    <LoginButton
                        text="Login"
                        type="primary"
                        labelStyle={{fontSize: 32}}
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
    },
    forgotLink: {
        color: Colors.textLink,
        fontSize: 16  
    }
});