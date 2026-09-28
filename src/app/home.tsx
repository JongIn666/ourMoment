import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Button, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';

export default function Home() {
    const auth = useAuth();

    if (auth.user) {
        return (
            <SafeAreaProvider>
                <SafeAreaViewThemed>
                    <Text>
                        HIIIIIIIIIII {auth.user.username}!!!!
                    </Text>

                    <Button
                        onPress={auth.signOut}
                        title="Log out"
                    />
                </SafeAreaViewThemed>
            </SafeAreaProvider>
        )
    }

    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed>
                <Text>
                    You're not logged in :(
                </Text>
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    )
}