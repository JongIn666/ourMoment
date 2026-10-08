import { useRouter } from 'expo-router';

import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { AddButton } from '@/components/add-button';
import { HomeEntry } from '@/components/home-entry';
import { Colors } from '@/constants/theme';

import { useAuth } from '@/context/auth';

export default function Home() {
    const auth = useAuth();
    const router = useRouter();

    if (auth.user) {
        return (
            <SafeAreaProvider>
                <SafeAreaViewThemed style={styles.container}>
                    <View style={styles.header}>
                        <Image
                            source={require('@/assets/images/logo-wordmark.png')}
                            style={{width: 317, height: 74}}
                        />

                        <Pressable
                            style={styles.settingButton}
                            onPress={() => router.navigate('/settings')}
                        >
                            <FontAwesomeIcon icon={faGear} size={32} color={Colors.icon.darkLime} />
                        </Pressable>
                    </View>

                    <View style={styles.mainContainer}>
                        <ScrollView contentContainerStyle={styles.groupContainer}>
                            <HomeEntry
                                imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                                label="Dog"
                                moreButton

                                onPress={() => router.navigate('/group')}
                            />

                            <HomeEntry
                                imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                                label="Dog"
                                moreButton
                            />

                            <HomeEntry
                                imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                                label="Dog"
                                moreButton
                            />

                            <HomeEntry
                                imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                                label="Dog"
                                moreButton
                            />

                            <HomeEntry
                                imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                                label="Dog"
                                moreButton
                            />

                            <HomeEntry
                                imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                                label="Dog"
                                moreButton
                            />

                            <HomeEntry
                                imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                                label="Dog"
                                moreButton
                            />
                        </ScrollView>

                        <AddButton style={styles.addGroupButton}/>
                    </View>

                    <HomeEntry
                        imageSrc={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                        label="yourMoments"

                        onPress={() => router.navigate('/profile')}
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

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 28
  },
  header: {
    width: '100%',
    alignItems: 'center'
  },
  settingButton: {
    position: "absolute",
    top: 0,
    right: 0
  },
  mainContainer: {
    flexShrink: 1
  },
  groupContainer: {
    gap: 16
  },
  addGroupButton: {
    position: "absolute",
    bottom: -20,
    right: 0,
  }
});