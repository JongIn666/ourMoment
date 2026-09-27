import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { LoginHeader, LoginPanel } from '@/components/other-login-ui';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { TextInputThemed } from '@/components/text-input-themed';

export default function CreateAccount() {
    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={ styles.container }>
                <BackButtonView/>

                <LoginHeader text="Let's start creating your moments!"/>

                <LoginPanel>
                    <TextInputThemed
                        placeholder="Email address"
                        inputMode="email"
                    />
                    <TextInputThemed
                        placeholder="Username"
                    />
                    <TextInputThemed
                        placeholder="Password"
                        secureTextEntry={true}
                    />
                    <TextInputThemed
                        placeholder="Re-enter password"
                        secureTextEntry={true}
                    />
                </LoginPanel>

                <LoginButton
                    text="Create account"
                    type="primary"
                />
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
       gap: 24 
    }
});