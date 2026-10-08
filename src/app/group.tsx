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

import { BackButtonView } from '@/components/back-button-view';
import { HomeEntry } from '@/components/home-entry';
import { Timeline } from '@/components/timeline';
import { TimelinePost } from '@/components/timeline-post';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export default function Group() {
    const router = useRouter();
    const { groupId } = useLocalSearchParams<{ groupId?: string }>();
    const { token } = useAuth();
    const [group, setGroup] = useState<authApi.UserGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            authApi.getGroup(token, id)
                .then((currentGroup) => {
                    if (isActive) setGroup(currentGroup);
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
  postsContain: {
    flexShrink: 1
    },
    groupStatus: {
        alignItems: 'center',
        paddingVertical: 18,
    },
    groupError: {
        alignSelf: 'stretch',
        color: Colors.interface.text,
        textAlign: 'center',
  }
});