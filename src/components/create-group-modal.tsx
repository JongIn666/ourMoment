import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { LoginButton } from '@/components/login-button';
import { ModalClose } from '@/components/modal-close';
import { ModalView } from '@/components/modal-view';
import { TextInputThemed } from '@/components/text-input-themed';
import { WhiteBox } from '@/components/white-box';
import { LoginError } from './other-login-ui';

import { Colors } from '@/constants/theme';

import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export type props = {
  visibleBoolean: boolean,
  closeFunction: () => void
};

export function CreateGroupModal({visibleBoolean, closeFunction}: props) {
    const { token } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorPopup, setErrorPopup] = useState<{ message: string } | null>(null);

    async function handleCreate() {
        const trimmedName = name.trim();
        if (!token) {
            setErrorPopup({ message: 'Sign in is required.' });
            return;
        }
        if (!trimmedName) {
            setErrorPopup({ message: 'Name is required.' });
            return;
        }
        if (trimmedName.length > 50 || !/^[A-Za-z0-9 ]+$/.test(trimmedName)) {
            setErrorPopup({
            message: 'Group names must be 1–50 characters and contain only letters, numbers, and spaces.',
            });
            return;
        }

        setIsSaving(true);
        try {
            const createdGroup = await authApi.createGroup(token, {
            name: trimmedName,
            description: 'What\'s 9 + 10?'
            });
            router.push({
                pathname: '/group',
                params: { groupId: String(createdGroup.id) },
            });
        } catch (caughtError) {
            setErrorPopup({
            message: caughtError instanceof Error ? caughtError.message : 'Could not create group. Please try again.',
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Modal
            visible={visibleBoolean}
            transparent
        >
            <ModalView style={styles.addGroupModal}>
                <ModalClose closeFunction={closeFunction}/>
                <WhiteBox style={styles.addGroupBox}>
                    <View style={styles.mainView}>
                        <Pressable style={styles.uploadGroupButton}>
                            <FontAwesomeIcon icon={faUpload} color={Colors.interface.text} size={40} />
                        </Pressable>
                        <TextInputThemed
                            autoCapitalize="none"
                            onChangeText={setName}
                            placeholder="Enter group name..."
                            value={name}
                            style={styles.groupNameInput}
                        />
                    </View>

                    {errorPopup && (
                        <LoginError>
                            {errorPopup.message}
                        </LoginError>
                    )}
                </WhiteBox>

                <LoginButton
                    text={isSaving ? 'Creating…' : 'Create group'}
                    type="primary"
                    disabled={isSaving}
                    onPress={handleCreate}
                />
            </ModalView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    addGroupModal: {
    gap: 18
  },
  addGroupBox: {
    padding: 11,
    alignItems: 'center'
  },
  mainView: {
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
})