import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { AddButton } from '@/components/add-button';
import { HomeEntry } from '@/components/home-entry';
import { ModalClose } from '@/components/modal-close';
import { ModalView } from '@/components/modal-view';
import { TextInputThemed } from '@/components/text-input-themed';
import { WhiteBox } from '@/components/white-box';
import { Colors } from '@/constants/theme';

import { LoginButton } from '@/components/login-button';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export default function Home() {
    const auth = useAuth();
    const router = useRouter();
    const [groups, setGroups] = useState<authApi.UserGroup[]>([]);
    const [profile, setProfile] = useState<authApi.Profile | null>(auth.user?.profile ?? null);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [groupsError, setGroupsError] = useState<string | null>(null);

    const [creatingGroup, setCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const loadHome = useCallback(() => {
        if (!auth.token) return () => {};

        let isActive = true;
        setIsLoadingGroups(true);
        setGroupsError(null);

        authApi.getProfile(auth.token)
            .then((currentProfile) => {
                if (isActive) setProfile(currentProfile);
            })
            .catch(() => {
                if (isActive && auth.user) setProfile(auth.user.profile);
            });

        authApi.getGroups(auth.token)
            .then((userGroups) => {
                if (isActive) setGroups(userGroups);
            })
            .catch((caughtError: unknown) => {
                if (isActive) {
                    setGroupsError(caughtError instanceof Error ? caughtError.message : 'Could not load your groups.');
                }
            })
            .finally(() => {
                if (isActive) setIsLoadingGroups(false);
            });

        return () => {
            isActive = false;
        };
    }, [auth.token, auth.user]);

    useFocusEffect(loadHome);

    if (auth.isLoading) {
        return (
            <SafeAreaProvider>
                <SafeAreaViewThemed style={styles.loading}>
                    <ActivityIndicator color={Colors.heading} />
                </SafeAreaViewThemed>
            </SafeAreaProvider>
        );
    }

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
                            {isLoadingGroups && groups.length === 0 ? (
                                <View style={styles.stateMessage}>
                                    <ActivityIndicator color={Colors.heading} />
                                    <Text style={styles.stateText}>Loading your groups…</Text>
                                </View>
                            ) : groupsError ? (
                                <View style={styles.stateMessage}>
                                    <Text style={styles.stateText}>{groupsError}</Text>
                                    <Pressable onPress={loadHome}>
                                        <Text style={styles.retryText}>Try again</Text>
                                    </Pressable>
                                </View>
                            ) : groups.length === 0 ? (
                                <Text style={styles.stateText}>No groups yet. Create one to get started.</Text>
                            ) : groups.map((group) => (
                                <HomeEntry
                                    key={group.id}
                                    imageSrc={require('@/assets/images/placeholder/chao-tales.jpg')}
                                    label={group.name}
                                    description={group.description}
                                    moreButton
                                    onPress={() => router.push({
                                        pathname: '/group',
                                        params: { groupId: String(group.id) },
                                    })}
                                />
                            ))}
                        </ScrollView>

                        <AddButton
                            accessibilityLabel="Create a group"
                            onPress={() => setCreatingGroup(true)}
                            style={styles.addGroupButton}
                        />
                    </View>

                    <HomeEntry
                        imageSrc={profile?.profilePicUrl
                            ? { uri: profile.profilePicUrl }
                            : require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                        label="yourMoments"

                        onPress={() => router.navigate('/profile')}
                    />

                    <Modal
                        visible={creatingGroup}
                        transparent
                    >
                        <ModalView style={styles.addGroupModal}>
                            <ModalClose closeFunction={() => setCreatingGroup(false)}/>
                            <WhiteBox style={styles.addGroupBox}>
                                <Pressable style={styles.uploadGroupButton}>
                                    <FontAwesomeIcon icon={faUpload} color={Colors.interface.text} size={40} />
                                </Pressable>
                                <TextInputThemed
                                    autoCapitalize="none"
                                    onChangeText={setNewGroupName}
                                    placeholder="Enter group name..."
                                    value={newGroupName}
                                    style={styles.groupNameInput}
                                />
                            </WhiteBox>

                            <LoginButton
                                text="Create group"
                                type="primary"
                            />
                        </ModalView>
                    </Modal>
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
        justifyContent: 'flex-start',
        gap: 20,
  },
  header: {
    width: '100%',
        alignItems: 'center',
  },
  settingButton: {
    position: "absolute",
    top: 0,
    right: 0
  },
  mainContainer: {
        flex: 1,
        width: '100%',
  },
  groupContainer: {
        gap: 16,
      alignItems: 'center',
        paddingBottom: 28,
  },
    loading: {
        justifyContent: 'center',
    },
    stateMessage: {
        alignItems: 'center',
        gap: 10,
        paddingVertical: 20,
    },
    stateText: {
        color: Colors.interface.text,
        fontSize: 16,
        textAlign: 'center',
    },
    retryText: {
        color: Colors.textLink,
        fontSize: 16,
        fontWeight: '700',
    },
  addGroupButton: {
    position: "absolute",
    bottom: -20,
    right: 0,
  },
  addGroupModal: {
    gap: 18
  },
  addGroupBox: {
    padding: 11,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center'
  },
  uploadGroupButton: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: Colors.box.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  groupNameInput: {
    flex: 1,
    alignSelf: 'auto',
    height: 40
  }
});
