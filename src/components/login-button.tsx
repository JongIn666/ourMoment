import { Colors } from '@/constants/theme';
import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type TextStyle } from 'react-native';

export type ButtonProps = PressableProps & {
  text: string,
  type?: 'primary' | 'secondary';
  labelStyle?: StyleProp<TextStyle>
};

export type LoginButtonProps = ButtonProps & {
  type?: 'primary' | 'secondary'
};

export function LoginButton({ text, type, style, labelStyle, ...rest }: LoginButtonProps) {
    return (
        <Pressable
            style={(state) => [
              styles.button,
              type == "primary" ? styles.primaryButton: styles.secondaryButton,
              typeof style === 'function' ? style(state) : style,
            ]}
            {...rest}
        >
            <Text
                style={[
                  styles.label,
                  type == "primary" ? styles.primaryLabel: styles.secondaryLabel,
                  labelStyle
                ]}
            >
              { text }
            </Text>
        </Pressable>
    )
}

export function DangerButton({ text, style, labelStyle, ...rest }: ButtonProps) {
    return (
        <Pressable
            style={(state) => [
              styles.button,
              styles.dangerButton,
              typeof style === 'function' ? style(state) : style,
            ]}
            {...rest}
        >
            <Text
                style={[
                  styles.label,
                  styles.dangerLabel,
                  labelStyle
                ]}
            >
              { text }
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    width: 248,
    height: 68
  },
  label: {
    textAlign: 'center',
    margin: 'auto',
    fontSize: 28
  },
  primaryButton: {
    backgroundColor: Colors.button.primary.color,
    borderColor: Colors.button.primary.border
  },
  primaryLabel: {
    color: Colors.button.primary.label
  },
  secondaryButton: {
    backgroundColor: Colors.button.secondary.color,
    borderColor: Colors.button.secondary.border
  },
  secondaryLabel: {
    color: Colors.button.secondary.label
  },
  dangerButton: {
    backgroundColor: Colors.button.danger.color,
    borderColor: Colors.button.danger.border
  },
  dangerLabel: {
    color: Colors.button.danger.label
  }
});