import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GoogleLoginButton } from '@/components/google-login-button';
import { LoginButton } from '@/components/login-button';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function LoggedOut() {
    const auth = useAuth();
    const router = useRouter(); 

    useEffect(() => {
        if (!auth.isLoading && auth.user) {
            router.replace('/home');
        }
    }, [auth.isLoading, auth.user, router]);

    if (auth.isLoading || auth.user) {
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
            <SafeAreaViewThemed style={styles.container}>
                <View>
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={{width: 313, height: 333}}
                    />
                </View>

                <View style={styles.loginButtons}>
                    <LoginButton
                        text="Login"
                        type="primary"
                        labelStyle={{fontSize: 32}}
                        onPress={() => router.navigate('/login')}
                    />

                    <LoginButton
                        text="Create account" 
                        type="secondary"
                        onPress={() => router.navigate('/create-account')}
                    />

                    <GoogleLoginButton/>
                </View>
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 84
  },
  loginButtons: {
    gap: 24
  },
  loading: {
    justifyContent: 'center',
  }
});
