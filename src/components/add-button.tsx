import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Colors } from '@/constants/theme';

export function AddButton({style, ...rest} : PressableProps) {
    return (
        <Pressable
            style={(state) => [
              styles.addButton,
              typeof style === 'function' ? style(state) : style,
            ]}
            {...rest}
        >
            <FontAwesomeIcon icon={faPlus} color={Colors.interface.text} size={48} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: Colors.box.background,
    borderColor: Colors.box.border,
    borderWidth: 2,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center"
  }
});