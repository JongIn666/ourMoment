import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { LoginHeader, LoginPanel } from '@/components/other-login-ui';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';
import { Colors } from '@/constants/theme';

export default function LogIn() {
    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={ styles.container }>
                <BackButtonView/>

                <LoginHeader text="Welcome back to your moment!"/>

                <LoginPanel>
                    <TextInputThemed
                        placeholder="Username"
                    />

                    <TextInputThemed
                        placeholder="Password"
                        secureTextEntry={true}
                    />

                    <Link style={ styles.forgotLink } href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Forgot password?</Link>
                </LoginPanel>

                <LoginButton
                    text="Login"
                    type="primary"
                    labelStyle={{fontSize: 32}}
                />
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
       gap: 24 
    },
    forgotLink: {
        color: Colors.textLink,
        fontSize: 16  
    }
});