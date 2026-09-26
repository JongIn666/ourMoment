import { StyleSheet, Text, type ViewProps } from 'react-native';

import { WhiteBox } from '@/components/white-box';

export type LoginHeaderProps = ViewProps & {
  text: string
};

export function LoginHeader({ text }: LoginHeaderProps) {
    return (
        <WhiteBox style={styles.headerBox}>
            <Text style={ styles.headerText }>
                { text }
            </Text>
        </WhiteBox>
    )
}

export function LoginPanel({ ...rest }: ViewProps) {
    return (
        <WhiteBox style={styles.loginPanel} {...rest}/>
    )
}

const styles = StyleSheet.create({
    headerBox: {
        padding: 6
    },
    headerText: {
        textAlign: 'center',
        fontSize: 28
    },
    loginPanel: {
        gap: 24,
        alignItems: 'center',
        padding: 24
    }
})