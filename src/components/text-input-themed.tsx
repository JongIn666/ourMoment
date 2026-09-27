import { Colors } from '@/constants/theme';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

export function TextInputThemed({ ...rest }: TextInputProps) {
    return (
        <TextInput
            style={ styles.input }
            { ...rest }
        />
    )
}

const styles = StyleSheet.create({
    input: {
        borderColor: Colors.interface.border,
        borderWidth: 1,
        color: Colors.interface.text,
        padding: 14,
        fontSize: 22,
        alignSelf: 'stretch'
    }
});