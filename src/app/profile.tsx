import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { faCakeCandles } from '@fortawesome/free-solid-svg-icons/faCakeCandles';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { BackButtonView } from '@/components/back-button-view';
import { Timeline } from '@/components/timeline';
import { TimelinePost } from '@/components/timeline-post';
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
        
                        <View style={styles.birthdayGift}>
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

                <WhiteBox style={styles.bio}>
                  <Text>
                    Hmph! He may be the fastest creature on the ground, but in the air, with me and my Extreme Gear, he's just a joke!
                  </Text>
                </WhiteBox>

                <Text style={styles.theirMomentsHeading}>
                  theirMoments
                </Text>

                <ScrollView contentContainerStyle={styles.timelineContainer} style={styles.timelineContainerSelf}>
                    <Timeline/>

                    <View style={styles.postsContain}>
                        <TimelinePost
                            date={new Date(2026,6,15,10,35)}
                            startOfDate
                            userIcon={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                            excerpt={"Blaze and I agree! Blaze is my friend, and Amy's my friend...."}
                            tags={['tag1', 'tag2']}
                            emojiReacts={[{emoji: {name: 'heart', type: 'unicode', unicode: '❤️'}, count: 1}]}
                            commentNum={2}
                        />

                        <TimelinePost
                            date={new Date(2026,6,15,19,35)}
                            userIcon={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                            excerpt={"Blaze and I agree! Blaze is my friend, and Amy's my friend...."}
                            tags={['tag1', 'tag2']}
                            emojiReacts={[{emoji: {name: 'heart', type: 'unicode', unicode: '❤️'}, count: 1}]}
                            commentNum={2}
                        />

                        <TimelinePost
                            date={new Date(2026,6,30,7,35)}
                            startOfDate
                            userIcon={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                            excerpt={"Blaze and I agree! Blaze is my friend, and Amy's my friend...."}
                            tags={['tag1', 'tag2']}
                            emojiReacts={[{emoji: {name: 'heart', type: 'unicode', unicode: '❤️'}, count: 1}]}
                            commentNum={2}
                        />
                    </View>
                </ScrollView>
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 360,
    padding: 11,
    gap: 10
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
  birthdayGift: {
    flexDirection: 'row',
    gap: 3
  },
  happyBirthday: {
    color: Colors.interface.text
  },
  settingButton: {
    position: "absolute",
    top: 11,
    right: 11
  },
  bio: {
    padding: 11
  },
  theirMomentsHeading: {
    alignSelf: 'flex-start',
    color: Colors.heading,
    fontSize: 24
  },
  timelineContainer: {
    flexDirection: 'row',
    gap: 10
  },
  timelineContainerSelf: {
    width: "100%"
  },
  postsContain: {
    flexShrink: 1
  }
})