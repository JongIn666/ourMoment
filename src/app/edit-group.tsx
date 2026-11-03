import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

import { BackButtonView } from '@/components/back-button-view';
import { DangerButton, LoginButton } from '@/components/login-button';
import { TextInputThemed } from '@/components/text-input-themed';
import { WhiteBox } from '@/components/white-box';

export default function EditGroup() {
    const [groupName, setGroupName] = useState('Dog');

    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={styles.container}>
                <BackButtonView/>

                <WhiteBox style={styles.groupHeader}>
                    <Image
                        source={require('@/assets/images/placeholder/chao-tales.jpg')}
                        style={styles.groupIcon}
                    />
                    <TextInputThemed
                        autoCapitalize="none"
                        onChangeText={setGroupName}
                        placeholder="Enter group name..."
                        value={groupName}
                        style={styles.groupNameInput}
                    />
                </WhiteBox>

                <LoginButton
                    text="Leave group"
                    type="primary"
                />

                <DangerButton
                    text="Delete group"
                />
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 360,
    padding: 11,
    gap: 10
  },
  groupIcon: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: Colors.box.border
  },
  groupNameInput: {
    flex: 1,
    alignSelf: 'auto',
    height: 40
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
    gap: 10,
    paddingBottom: 25
  },
  timelineContainerSelf: {
    width: "100%"
  },
  postsContain: {
    flexShrink: 1
  }
})