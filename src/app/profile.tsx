import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { faCakeCandles } from '@fortawesome/free-solid-svg-icons/faCakeCandles';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { BackButtonView } from '@/components/back-button-view';
import { WhiteBox } from '@/components/white-box';
import { Colors } from '@/constants/theme';

export default function Profile() {
    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={styles.container}>
                <BackButtonView/>

                <WhiteBox style={styles.profileHeader}>
                    <Image
                        source={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                        style={styles.userIcon}
                    />
        
                    <View style={styles.basicInfo}>
                        <View>
                            <Text style={styles.displayNameLabel}>
                                Jet the Hmmawk 🤨
                            </Text>
                            <Text style={styles.usernameLabel}>
                                @JettisonQHawkington
                            </Text>
                        </View>
        
                        <View>
                            <FontAwesomeIcon icon={faCakeCandles} color={Colors.interface.text} size={16} />
                            <Text style={styles.happyBirthday}>
                                { new Date("2006-02-21").toLocaleString('en-US', {dateStyle: 'long'})  }
                            </Text>
                        </View>
                    </View>
        
                    <Pressable style={styles.settingButton}>
                        <FontAwesomeIcon icon={faGear} color={Colors.interface.text} size={24} />
                    </Pressable>
                </WhiteBox>
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
  container: {
    gap: 18
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 360,
    padding: 11,
    gap: 18
  },
  userIcon: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: Colors.box.border
  },
  basicInfo: {
    gap: 5
  },
  displayNameLabel: {
    fontSize: 18
  },
  usernameLabel: {
    fontSize: 14,
    color: Colors.interface.text
  },
  happyBirthday: {
    color: Colors.interface.text
  },
  settingButton: {
    position: "absolute",
    top: 11,
    right: 11
  }
})