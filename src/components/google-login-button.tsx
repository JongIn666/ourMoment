import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoginButton } from '@/components/login-button';
import { LoginError } from '@/components/other-login-ui';
import { GOOGLE_IOS_CLIENT_ID } from '@/constants/google';
import { useAuth } from '@/context/auth';

WebBrowser.maybeCompleteAuthSession();

export function GoogleLoginButton() {
    const auth = useAuth();
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: GOOGLE_IOS_CLIENT_ID,
    });

    useEffect(() => {
        if (response?.type === 'error') {
            setError('Google sign-in was not completed. Please try again.');
            return;
        }
        if (response?.type !== 'success') return;

        const idToken = response.params.id_token ?? response.authentication?.idToken;
        if (!idToken) {
            setError('Google did not return an ID token. Please try again.');
            return;
        }

        auth.signInWithGoogle(idToken)
            .then(() => router.replace('/home'))
            .catch((caughtError: unknown) => {
                setError(caughtError instanceof Error ? caughtError.message : 'Unable to sign in with Google.');
            });
    }, [auth, response, router]);

    return (
        <View style={styles.container}>
            <LoginButton
                text="Continue with Google"
                type="secondary"
                labelStyle={styles.label}
                disabled={!request}
                onPress={() => {
                    setError(null);
                    promptAsync();
                }}
            />

            {error && (
                <LoginError>
                    {error}
                </LoginError>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 8
    },
    label: {
        fontSize: 22
    }
});
