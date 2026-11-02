import { Colors } from '@/constants/theme';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

export function TextInputThemed({style, ...rest }: TextInputProps) {
    return (
        <TextInput
            style={[ styles.input , style]}
            placeholderTextColor={Colors.interface.text}
            { ...rest }
        />
    )
}

const styles = StyleSheet.create({
    input: {
        borderColor: Colors.interface.border,
        borderWidth: 1,
        padding: 14,
        fontSize: 22,
        alignSelf: 'stretch'
    }
});