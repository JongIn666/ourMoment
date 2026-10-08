import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoginButton } from '@/components/login-button';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Colors } from '@/constants/theme';

export default function EditPasswordSuccess() {
    const router = useRouter();

    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={styles.container}>
                <Text style={styles.heading}>
                    Changed successfully
                </Text>

                <LoginButton
                    text="Back"
                    type="primary"
                    onPress={() => router.replace('/settings')}
                />
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 24,
        justifyContent: 'center'
    },
    heading: {
        color: Colors.heading,
        fontSize: 28,
        textAlign: 'center'
    }
});
