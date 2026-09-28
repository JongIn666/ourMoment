import { useRouter } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoginButton } from '@/components/login-button';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';

export default function LoggedOut() {
    const router = useRouter(); 

    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={styles.container}>
                <View>
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={{width: 282, height: 333}}
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
  }
});