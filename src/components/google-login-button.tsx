import { ResponseType } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoginButton } from '@/components/login-button';
import { LoginError } from '@/components/other-login-ui';
import { GOOGLE_IOS_CLIENT_ID } from '@/constants/google';
import { useAuth } from '@/context/auth';

WebBrowser.maybeCompleteAuthSession();

export function GoogleLoginButton() {
    const { signInWithGoogle } = useAuth();
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const handledIdTokenRef = useRef<string | null>(null);

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        responseType: ResponseType.IdToken,
    });

    useEffect(() => {
        let isActive = true;

        async function handleResponse() {
            if (response?.type === 'error') {
                if (isActive) {
                    setError('Google sign-in was not completed. Please try again.');
                }
                return;
            }
            if (response?.type !== 'success') return;

            const idToken = response.params.id_token ?? response.authentication?.idToken;
            if (!idToken) {
                if (isActive) {
                    setError('Google did not return an ID token. Please try again.');
                }
                return;
            }
            if (handledIdTokenRef.current === idToken) return;

            handledIdTokenRef.current = idToken;
            if (isActive) {
                setIsSigningIn(true);
            }

            try {
                await signInWithGoogle(idToken);
                if (isActive) {
                    router.replace('/home');
                }
            } catch (caughtError: unknown) {
                handledIdTokenRef.current = null;
                if (isActive) {
                    setError(caughtError instanceof Error ? caughtError.message : 'Unable to sign in with Google.');
                }
            } finally {
                if (isActive) {
                    setIsSigningIn(false);
                }
            }
        }

        void handleResponse();

        return () => {
            isActive = false;
        };
    }, [response, router, signInWithGoogle]);

    return (
        <View style={styles.container}>
            <LoginButton
                text="Continue with Google"
                type="secondary"
                labelStyle={styles.label}
                disabled={!request || isSigningIn}
                onPress={() => {
                    setError(null);
                    void promptAsync({ preferEphemeralSession: true }).catch((caughtError: unknown) => {
                        setError(
                            caughtError instanceof Error
                                ? caughtError.message
                                : 'Google sign-in could not be started. Please try again.',
                        );
                    });
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
