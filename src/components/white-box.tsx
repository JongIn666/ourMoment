import { Colors } from '@/constants/theme';
import { StyleSheet, View, type ViewProps } from 'react-native';

export function WhiteBox({style, ...rest}: ViewProps) {
    return (
        <View 
            style={ [styles.whiteBox, style] }
            {...rest}   
        />
    )
}

const styles = StyleSheet.create({
    whiteBox: {
        backgroundColor: Colors.box.background,
        borderColor: Colors.box.border,
        borderWidth: 2,
        alignSelf: 'stretch'
    }
})