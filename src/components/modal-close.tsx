import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Pressable, PressableProps, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';

export type ModalCloseProps = PressableProps & {
  closeFunction: () => void,
};

export function ModalClose({ closeFunction, ...rest }: ModalCloseProps) {
    return (
            <Pressable
            style={styles.closeButton}
            onPress={closeFunction}
            {...rest}
        >
            <FontAwesomeIcon icon={faXmark} color={Colors.icon.white} size={24} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 44,
    right: 14
  }
})
