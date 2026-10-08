import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export default function Profile() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<authApi.Profile | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (token) {
        authApi.getProfile(token)
          .then((currentProfile) => {
            if (isActive) setProfile(currentProfile);
          })
          .catch(() => {
            if (isActive && user) setProfile(user.profile);
          });
      }
      return () => {
        isActive = false;
      };
    }, [token, user]),
  );

  const birthday = profile?.birthday
    ? new Date(`${profile.birthday}T00:00:00`).toLocaleDateString('en-US', { dateStyle: 'long' })
    : null;
  const age = profile?.birthday ? calculateAge(profile.birthday) : null;
  const ageEmoji = age === null ? null : getAgeEmoji(age);

    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={styles.container}>
                <BackButtonView/>

                <WhiteBox style={styles.profileHeader}>
                    <Image
                      source={profile?.profilePicUrl
                        ? { uri: profile.profilePicUrl }
                        : require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                        style={styles.userIcon}
                    />
        
                    <View style={styles.basicInfo}>
                        <View>
                            <Text style={styles.displayNameLabel}>
                            {profile?.displayName || profile?.username || user?.username || 'Your profile'}
                            </Text>
                            <Text style={styles.usernameLabel}>
                            @{profile?.username || user?.username || ''}
                            </Text>
                        </View>
        
                        {profile?.showBirthday && birthday && (
                          <View style={styles.profileDetail}>
                            <FontAwesomeIcon icon={faCakeCandles} color={Colors.interface.text} size={16} />
                            <Text style={styles.happyBirthday}>{birthday}</Text>
                          </View>
                        )}
                        {profile?.showAge && age !== null && ageEmoji && (
                          <View style={styles.profileDetail}>
                            <Text style={styles.ageEmoji}>{ageEmoji}</Text>
                            <Text style={styles.happyBirthday}>{age} years old</Text>
                          </View>
                        )}
                    </View>
        
                      <Pressable
                        accessibilityLabel="Edit profile settings"
                        hitSlop={10}
                        onPress={() => router.push('/edit-profile')}
                        style={styles.settingButton}
                      >
                        <FontAwesomeIcon icon={faGear} color={Colors.interface.text} size={24} />
                    </Pressable>
                </WhiteBox>

                <WhiteBox style={styles.bio}>
                  <Text>
                      {profile?.bio || 'Add a little about yourself in profile settings.'}
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

function calculateAge(birthday: string) {
  const birthDate = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  if (birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayHasPassed) age -= 1;
  return age;
}

function getAgeEmoji(age: number) {
  if (age <= 12) return '🧸';
  if (age <= 19) return '🎓';
  if (age <= 45) return '💪';
  return '🧓';
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
  profileDetail: {
    flexDirection: 'row',
    gap: 3
  },
  ageEmoji: {
    fontSize: 15,
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