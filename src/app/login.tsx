import { Link } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoginButton } from '@/components/login-button';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Colors } from '@/constants/theme';

export default function LogIn() {
    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={ styles.container }>
                <View style={ [styles.whiteBox, styles.headerBox] }>
                    <Text style={ styles.headerText }>
                        Welcome back to your moment!
                    </Text>
                </View>

                <View style={ [styles.whiteBox, styles.loginPanel] }>
                    <TextInput
                        style={ styles.input }
                        placeholder="Username"
                    />

                    <TextInput
                        style={ styles.input }
                        placeholder="Password"
                    />

                    <Link style={ styles.forgotLink } href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Forgot password?</Link>
                </View>

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
    whiteBox: {
        backgroundColor: Colors.box.background,
        borderColor: Colors.box.border,
        borderWidth: 2,
        alignSelf: 'stretch',
        padding: 24
    },
    headerBox: {
        padding: 6
    },
    headerText: {
        textAlign: 'center',
        fontSize: 28
    },
    loginPanel: {
        gap: 24,
        alignItems: 'center'
    },
    input: {
        borderColor: Colors.interface.border,
        borderWidth: 1,
        color: Colors.interface.text,
        padding: 14,
        fontSize: 22,
        alignSelf: 'stretch'
    },
    forgotLink: {
        color: Colors.textLink,
        fontSize: 16  
    }
});