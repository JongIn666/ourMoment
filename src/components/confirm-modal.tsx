import { Modal, StyleSheet, Text } from 'react-native';

import { DangerButton, LoginButton } from '@/components/login-button';
import { ModalView } from '@/components/modal-view';
import { WhiteBox } from '@/components/white-box';

export type props = {
  visibleBoolean: boolean,
  closeFunction: () => void,
  label: string,
  danger?: boolean
  yesLabel?: string,
  noLabel?: string
};

export function ConfirmModal({visibleBoolean, closeFunction, label, danger, yesLabel, noLabel}: props) {
    return (
        <Modal
            visible={visibleBoolean}
            transparent
        >
            <ModalView style={styles.confirmModal}>
                <WhiteBox style={styles.labelBox}>
                    <Text style={styles.label}>
                        {label}
                    </Text>
                </WhiteBox>

                {danger ? (
                    <>
                        <DangerButton
                            text={(yesLabel != null) ? yesLabel : "Yes"}
                        />
                        <LoginButton
                            text={(noLabel != null) ? noLabel : "No"}
                            type="primary"
                            onPress={closeFunction}
                        />
                    </>
                )
                : (
                    <>
                        <LoginButton
                            text={(yesLabel != null) ? yesLabel : "Yes"}
                            type="primary"
                        />
                        <LoginButton
                            text={(noLabel != null) ? noLabel : "No"}
                            type="secondary"
                            onPress={closeFunction}
                        />
                    </>
                )
                }
            </ModalView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    confirmModal: {
        gap: 18
    },
    labelBox: {
        padding: 11,
        minHeight: 75,
        justifyContent: 'center'
    },
    label: {
        fontSize: 16,
        textAlign: 'center'
    }
})