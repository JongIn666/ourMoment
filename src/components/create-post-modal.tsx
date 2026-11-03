import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { LoginButton } from '@/components/login-button';
import { ModalClose } from '@/components/modal-close';
import { ModalView } from '@/components/modal-view';
import { TextInputThemed } from '@/components/text-input-themed';
import { WhiteBox } from '@/components/white-box';

export type props = {
  visibleBoolean: boolean,
  closeFunction: () => void
};

export function CreatePostModal({visibleBoolean, closeFunction}: props) {
    const [content, setContent] = useState('');

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
                </WhiteBox>

                <LoginButton
                    text="Post"
                    type="primary"
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
        padding: 11
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