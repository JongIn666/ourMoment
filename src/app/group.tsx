import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons/faUserGroup';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { AddButton } from '@/components/add-button';
import { BackButtonView } from '@/components/back-button-view';
import { CreatePostModal } from '@/components/create-post-modal';
import { HomeEntry } from '@/components/home-entry';
import { Timeline } from '@/components/timeline';
import { TimelinePost } from '@/components/timeline-post';

import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export default function Group() {
    const router = useRouter();
    const { groupId } = useLocalSearchParams<{ groupId?: string }>();
    const { token, user } = useAuth();
    const [group, setGroup] = useState<authApi.UserGroup | null>(null);
    const [posts, setPosts] = useState<authApi.UserPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creatingPost, setCreatingPost] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const id = Number(groupId);
            if (!token || !Number.isInteger(id) || id <= 0) {
                setError('This group could not be found.');
                setIsLoading(false);
                return () => {
                    isActive = false;
                };
            }

            setIsLoading(true);
            setError(null);
            Promise.all([
                authApi.getGroup(token, id),
                authApi.getGroupPosts(token, id),
            ])
                .then(([currentGroup, currentPosts]) => {
                    if (isActive) {
                        setGroup(currentGroup);
                        setPosts(currentPosts);
                    }
                })
                .catch((caughtError: unknown) => {
                    if (isActive) {
                        setError(caughtError instanceof Error ? caughtError.message : 'Could not load this group.');
                    }
                })
                .finally(() => {
                    if (isActive) setIsLoading(false);
                });

            return () => {
                isActive = false;
            };
        }, [groupId, token]),
    );

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

                        <Pressable
                            accessibilityLabel="View group members"
                            hitSlop={8}
                            onPress={() => group && router.push({
                                pathname: '/group-members',
                                params: { groupId: String(group.id) },
                            })}
                        >
                            <FontAwesomeIcon icon={faUserGroup} size={32} color={Colors.icon.darkLime} />
                        </Pressable>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.groupStatus}>
                        <ActivityIndicator color={Colors.heading} />
                    </View>
                ) : error ? (
                    <Text style={styles.groupError}>{error}</Text>
                ) : group ? (
                    <HomeEntry
                        imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                        label={group.name}
                        description={group.description}
                        settingButton
                        onSettingPress={() => router.push({
                            pathname: '/edit-group',
                            params: { groupId: String(group.id) },
                        })}
                    />
                ) : null}

                <ScrollView contentContainerStyle={styles.mainContainer} style={styles.mainContainerSelf}>
                    {isLoading ? (
                        <View style={styles.postsState}>
                            <ActivityIndicator color={Colors.heading} />
                        </View>
                    ) : error ? (
                        <Text style={styles.postsEmpty}>{error}</Text>
                    ) : posts.length === 0 ? (
                        <Text style={styles.postsEmpty}>No posts in this group yet.</Text>
                    ) : (
                            <>
                            <Timeline/>
                            <View style={styles.postsContain}>
                                {posts.map((post, index) => {
                                    const postDate = new Date(post.createdAt);
                                    const previousDate = index > 0 ? new Date(posts[index - 1].createdAt) : null;
                                    const startsNewDate = !previousDate ||
                                        postDate.toDateString() !== previousDate.toDateString();

                                    return (
                                        <TimelinePost
                                            key={post.id}
                                            date={postDate}
                                            startOfDate={startsNewDate}
                                            userIcon={post.author.profilePicUrl
                                                ? { uri: post.author.profilePicUrl }
                                                : require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                                            excerpt={`@${post.author.username}\n${post.content}`}
                                            tags={[]}
                                            emojiReacts={[]}
                                            commentNum={0}
                                            isOwnPost={post.author.id === user?.id}
                                            onDelete={async () => {
                                                if (!token) throw new Error('Please sign in again to delete this post.');
                                                await authApi.deletePost(token, post.id);
                                                setPosts((currentPosts) => currentPosts.filter(({ id }) => id !== post.id));
                                            }}
                                            onEditPress={() => {
                                                router.push({
                                                    pathname: '/edit-post',
                                                    params: {
                                                        postId: String(post.id),
                                                        groupId: String(post.group),
                                                        content: post.content,
                                                        createdAt: post.createdAt,
                                                    },
                                                });
                                            }}
                                        />
                                    );
                                })}
                            </View>
                            </>
                        )
                    }
                </ScrollView>
                {group && (
                    <AddButton
                        accessibilityLabel="Create post"
                        onPress={() => setCreatingPost(true)}
                        style={styles.addPostButton}
                    />
                )}

                <CreatePostModal
                    visibleBoolean={creatingPost}
                    closeFunction={() => setCreatingPost(false)}
                    groupId={groupId}
                />
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
    addPostButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
    },
  mainContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 25
  },
  mainContainerSelf: {
    width: "100%"
  },
  postsContain: {
    flexShrink: 1
    },
    postsState: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    postsEmpty: {
        color: Colors.error,
        padding: 16,
        textAlign: 'center',
    },
    groupStatus: {
        alignItems: 'center',
        paddingVertical: 18,
    },
    groupError: {
        alignSelf: 'stretch',
        color: Colors.error,
        textAlign: 'center',
  }
});
