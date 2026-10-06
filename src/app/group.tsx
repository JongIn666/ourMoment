import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons/faUserGroup';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { BackButtonView } from '@/components/back-button-view';
import { HomeEntry } from '@/components/home-entry';
import { TimelinePost } from '@/components/timeline-post';

export default function Group() {
    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={styles.container}>
                <View style={styles.buttonHeader}>
                    <BackButtonView/>

                    <View style={styles.groupControls}>
                        <Pressable>
                            <FontAwesomeIcon icon={faCalendar} size={32} color={Colors.icon.darkLime} />
                        </Pressable>

                        <Pressable>
                            <FontAwesomeIcon icon={faFilter} size={32} color={Colors.icon.darkLime} />
                        </Pressable>

                        <Pressable>
                            <FontAwesomeIcon icon={faUserGroup} size={32} color={Colors.icon.darkLime} />
                        </Pressable>
                    </View>
                </View>

                <HomeEntry
                    imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                    label="Dog"
                    settingButton
                />

                <ScrollView contentContainerStyle={styles.mainContainer} style={styles.mainContainerSelf}>
                    <View style={styles.timeLine}/>

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
    gap: 18
  },
  buttonHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },
  groupControls: {
    flexDirection: 'row',
    gap: 10
  },
  mainContainer: {
    flexDirection: 'row',
    gap: 10
  },
  mainContainerSelf: {
    width: "100%"
  },
  timeLine: {
    backgroundColor: Colors.timeLine,
    width: 30,
    height: 1000,
    borderRadius: 50,
    marginLeft: 50
  },
  postsContain: {
    flexShrink: 1
  }
});