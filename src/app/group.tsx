import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Link } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar';
import { faComment } from '@fortawesome/free-solid-svg-icons/faComment';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons/faUserGroup';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { BackButtonView } from '@/components/back-button-view';
import { HomeEntry } from '@/components/home-entry';
import { WhiteBox } from '@/components/white-box';

export default function Home() {
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
                        <View style={styles.postContain}>
                            <View style={styles.timeLabelContain}>
                                <View style={styles.dateAndTimeLabel}>
                                    <View style={styles.dateLabelView}>
                                        <Text style={[styles.dateLabel, styles.monthLabel]}>Jul</Text>
                                        <Text style={[styles.dateLabel, styles.dayLabel]}>15</Text>
                                    </View>
                                    <Text style={styles.timeLabel}>
                                        10:35 AM
                                    </Text>
                                </View>
                                <View style={styles.timeCircle}/>
                            </View>
                            <WhiteBox style={styles.post}>
                                <View style={styles.postRow1}>
                                    <Text style={styles.postText}>
                                        Blaze and I agree! Blaze is my friend, and Amy's my friend....
                                    </Text>
                                    <Image
                                        source={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                                        style={styles.postUserIcon}
                                    />
                                </View>
                                <View style={styles.postRowTags}>
                                    <Link href="https://www.youtube.com/watch?v=2yJgwwDcgV8" style={styles.postTag}>
                                        #tag1
                                    </Link>
                                    <Link href="https://www.youtube.com/watch?v=2qvAxPqy2wA" style={styles.postTag}>
                                        #tag2
                                    </Link>
                                </View>
                                <View style={styles.postRowMedia}>
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                </View>
                                <View style={styles.postRowReact}>
                                    <View style={styles.reactView}>
                                        <Text style={styles.reactLabel}>
                                            ❤️
                                        </Text>
                                        <Text style={styles.reactLabel}>
                                            1
                                        </Text>
                                    </View>

                                    <View style={styles.reactView}>
                                        <FontAwesomeIcon icon={faComment} color={Colors.interface.text} size={16} />
                                        <Text style={styles.reactLabel}>
                                            2
                                        </Text>
                                    </View>
                                </View>
                            </WhiteBox>
                        </View>

                        <View style={styles.postContain}>
                            <View style={styles.timeLabelContain}>
                                <Text style={styles.timeLabel}>
                                    7:35 PM
                                </Text>
                                <View style={styles.timeCircle}/>
                            </View>
                            <WhiteBox style={styles.post}>
                                <View style={styles.postRow1}>
                                    <Text style={styles.postText}>
                                        Blaze and I agree! Blaze is my friend, and Amy's my friend....
                                    </Text>
                                    <Image
                                        source={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                                        style={styles.postUserIcon}
                                    />
                                </View>
                                <View style={styles.postRowTags}>
                                    <Link href="https://www.youtube.com/watch?v=2yJgwwDcgV8" style={styles.postTag}>
                                        #tag1
                                    </Link>
                                    <Link href="https://www.youtube.com/watch?v=2qvAxPqy2wA" style={styles.postTag}>
                                        #tag2
                                    </Link>
                                </View>
                                <View style={styles.postRowMedia}>
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                </View>
                                <View style={styles.postRowReact}>
                                    <View style={styles.reactView}>
                                        <Text style={styles.reactLabel}>
                                            ❤️
                                        </Text>
                                        <Text style={styles.reactLabel}>
                                            1
                                        </Text>
                                    </View>

                                    <View style={styles.reactView}>
                                        <FontAwesomeIcon icon={faComment} color={Colors.interface.text} size={16} />
                                        <Text style={styles.reactLabel}>
                                            2
                                        </Text>
                                    </View>
                                </View>
                            </WhiteBox>
                        </View>

                        <View style={styles.postContain}>
                            <View style={styles.timeLabelContain}>
                                <View style={styles.dateAndTimeLabel}>
                                    <View style={styles.dateLabelView}>
                                        <Text style={[styles.dateLabel, styles.monthLabel]}>Jul</Text>
                                        <Text style={[styles.dateLabel, styles.dayLabel]}>30</Text>
                                    </View>
                                    <Text style={styles.timeLabel}>
                                        7:35 AM
                                    </Text>
                                </View>
                                <View style={styles.timeCircle}/>
                            </View>
                            <WhiteBox style={styles.post}>
                                <View style={styles.postRow1}>
                                    <Text style={styles.postText}>
                                        Blaze and I agree! Blaze is my friend, and Amy's my friend....
                                    </Text>
                                    <Image
                                        source={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                                        style={styles.postUserIcon}
                                    />
                                </View>
                                <View style={styles.postRowTags}>
                                    <Link href="https://www.youtube.com/watch?v=2yJgwwDcgV8" style={styles.postTag}>
                                        #tag1
                                    </Link>
                                    <Link href="https://www.youtube.com/watch?v=2qvAxPqy2wA" style={styles.postTag}>
                                        #tag2
                                    </Link>
                                </View>
                                <View style={styles.postRowMedia}>
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                    <Image
                                        source={require('@/assets/images/placeholder/slendy.jpg')}
                                        style={styles.postMedia}
                                    />
                                </View>
                                <View style={styles.postRowReact}>
                                    <View style={styles.reactView}>
                                        <Text style={styles.reactLabel}>
                                            ❤️
                                        </Text>
                                        <Text style={styles.reactLabel}>
                                            1
                                        </Text>
                                    </View>

                                    <View style={styles.reactView}>
                                        <FontAwesomeIcon icon={faComment} color={Colors.interface.text} size={16} />
                                        <Text style={styles.reactLabel}>
                                            2
                                        </Text>
                                    </View>
                                </View>
                            </WhiteBox>
                        </View>
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
  timeLabelContain: {
    position: 'relative',
    right: 88,
    top: 55,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  dateAndTimeLabel: {
    position: 'relative',
    bottom: 25
  },
  dateLabelView: {
    alignItems: 'center'
  },
  dateLabel: {
    color: Colors.label
  },
  monthLabel: {
    fontSize: 24
  },
  dayLabel: {
    fontSize: 20
  },
  timeLabel: {
    color: Colors.label,
    fontSize: 10
  },
  timeCircle: {
    backgroundColor: Colors.timeCircle,
    width: 25,
    height: 25,
    borderRadius: 100
  },
  postsContain: {
    flexShrink: 1
  },
  postContain: {
    width: "100%"
  },
  post: {
    padding: 12,
    gap: 7
  },
  postRow1: {
    flexDirection: 'row',
    gap: 10
  },
  postText: {
    fontSize: 14,
    flexShrink: 1
  },
  postUserIcon: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: Colors.box.border
  },
  postRowTags: {
    flexDirection: 'row',
    gap: 4
  },
  postTag: {
    color: Colors.interface.text
  },
  postRowMedia: {
    flexDirection: 'row'
  },
  postMedia: {
    width: 58,
    height: 58,
    borderWidth: 2,
    borderColor: Colors.box.border
  },
  postRowReact: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: -22,
    right: 10,
    gap: 8
  },
  reactView: {
    backgroundColor: Colors.interface.box,
    height: 30,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  reactLabel: {
    fontSize: 16
  }
});