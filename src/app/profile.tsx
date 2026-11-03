import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [posts, setPosts] = useState<authApi.UserPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (token) {
        setIsLoadingPosts(true);
        setPostsError(null);
        authApi.getProfile(token)
          .then((currentProfile) => {
            if (isActive) setProfile(currentProfile);
          })
          .catch(() => {
            if (isActive && user) setProfile(user.profile);
          });

        authApi.getMyPosts(token)
          .then((currentPosts) => {
            if (isActive) {
              setPosts(currentPosts.filter((post) => !post.isDraft).sort(
                (first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt),
              ));
            }
          })
          .catch((caughtError: unknown) => {
            if (isActive) {
              setPostsError(caughtError instanceof Error ? caughtError.message : 'Could not load your moments.');
            }
          })
          .finally(() => {
            if (isActive) setIsLoadingPosts(false);
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

  async function deletePost(postId: number) {
    if (!token) throw new Error('You must be signed in to delete a post.');
    await authApi.deletePost(token, postId);
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
  }

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

                <Text style={styles.theirMomentsHeading}>
                  theirMoments
                </Text>

                <ScrollView contentContainerStyle={styles.timelineContainer} style={styles.timelineContainerSelf}>
                    <Timeline/>

                    <View style={styles.postsContain}>
                        {isLoadingPosts ? (
                          <View style={styles.postsState}>
                            <ActivityIndicator color={Colors.heading} />
                          </View>
                        ) : postsError ? (
                          <Text style={styles.postsEmpty}>{postsError}</Text>
                        ) : posts.length === 0 ? (
                          <Text style={styles.postsEmpty}>No moments yet.</Text>
                        ) : posts.map((post, index) => {
                          const postDate = new Date(post.createdAt);
                          const previousDate = index > 0 ? new Date(posts[index - 1].createdAt) : null;
                          const startsNewDate = !previousDate || postDate.toDateString() !== previousDate.toDateString();

                          return (
                            <TimelinePost
                              key={post.id}
                              date={postDate}
                              startOfDate={startsNewDate}
                              userIcon={post.author.profilePicUrl
                                ? { uri: post.author.profilePicUrl }
                                : require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                              excerpt={post.content}
                              media={post.media}
                              link={post.link}
                              reactionCounts={post.reactionCounts ?? {}}
                              tags={[]}
                              emojiReacts={[]}
                              commentNum={0}
                              isOwnPost
                              onDelete={() => deletePost(post.id)}
                              onEditPress={() => router.push({
                                pathname: '/edit-post',
                                params: {
                                  postId: String(post.id),
                                  content: post.content,
                                  createdAt: post.createdAt,
                                },
                              })}
                            />
                          );
                        })}
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
  theirMomentsHeading: {
    alignSelf: 'flex-start',
    color: Colors.heading,
    fontSize: 24
  },
  timelineContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 25
  },
  timelineContainerSelf: {
    flex: 1,
    width: "100%"
  },
  postsContain: {
    flexGrow: 1,
    flexShrink: 1
  },
  postsState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  postsEmpty: {
    color: Colors.interface.text,
    padding: 16,
    textAlign: 'center',
  }
})
