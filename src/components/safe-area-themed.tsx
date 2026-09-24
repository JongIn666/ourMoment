import { Colors } from '@/constants/theme';
import { Platform, StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ThemedProps = ViewProps;

export function SafeAreaViewThemed({ style, ...rest }: ThemedProps) {
    return (
        <SafeAreaView style={[styles.container, style]} {...rest}/>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        fontFamily: Platform.select({
            android: 'NotoSans_400Regular',
            ios: 'NotoSans-Regular'
        }),
        flex: 1,
        alignItems: 'center',
        padding: 14
    }
});