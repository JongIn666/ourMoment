import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { LoginButton } from '@/components/login-button';
import { ModalClose } from '@/components/modal-close';
import { ModalView } from '@/components/modal-view';
import { TextInputThemed } from '@/components/text-input-themed';
import { WhiteBox } from '@/components/white-box';
import { LoginError } from './other-login-ui';

import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export type props = {
  visibleBoolean: boolean,
  closeFunction: () => void,
  groupId: number
};

export function CreatePostModal({visibleBoolean, closeFunction, groupId}: props) {
    const { token } = useAuth();
    const [content, setContent] = useState('');
    const [postDate, setPostDate] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCreate() {
        const id = Number(groupId);
        const trimmedContent = content.trim();
        if (!token || !Number.isInteger(id) || id <= 0) {
            setError('This group could not be found.');
            return;
        }
        if (!trimmedContent) {
            setError('Write something before creating the post.');
            return;
        }

        setError(null);
        setIsSaving(true);
        try {
            await authApi.createPost(token, id, {
            content: trimmedContent,
            createdAt: postDate.toISOString(),
            });
            closeFunction();
        } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : 'Could not create the post.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Modal
            visible={visibleBoolean}
            transparent
        >
            <ModalView style={styles.addPostModal}>
                <ModalClose closeFunction={closeFunction}/>
                <WhiteBox style={styles.addPostBox}>
                    <View style={styles.mainView}>
                        <TextInputThemed
                            autoCapitalize="none"
                            onChangeText={setContent}
                            placeholder="What's your moment?"
                            value={content}
                            style={styles.contentInput}
                            multiline
                        />
                    </View>

                    {error && (
                        <LoginError>
                            {error}
                        </LoginError>
                    )}
                </WhiteBox>

                <LoginButton
                    text={isSaving ? 'Creating…' : 'Create post'}
                    type="primary"
                    disabled={isSaving}
                    onPress={handleCreate}
                />
            </ModalView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    addPostModal: {
        gap: 18
    },
    addPostBox: {
        padding: 11,
        gap: 7
    },
    mainView: {
        gap: 7
    },
    contentInput: {
        height: 140,
        fontSize: 14,
        textAlignVertical: 'top'
    }
})