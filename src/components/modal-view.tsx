import { Colors } from '@/constants/theme';
import { StyleSheet, View, ViewProps } from 'react-native';

export type ThemedProps = ViewProps;

export function ModalView({ style, ...rest }: ThemedProps) {
    return (
        <View 
            style={[styles.container, style]}
            {...rest}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.modalBG,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    }
});