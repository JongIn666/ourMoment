import { Colors, Font } from '@/constants/theme';
import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type TextStyle } from 'react-native';

export type LoginButtonProps = PressableProps & {
  text: string,
  type?: 'primary' | 'secondary';
  labelStyle?: StyleProp<TextStyle>
};

export function LoginButton({ text, type, style, labelStyle }: LoginButtonProps) {
    return (
        <Pressable
            style={[
              styles.button,
              type == "primary" ? styles.primaryButton: styles.secondaryButton,
              style
            ]}
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

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    width: 248,
    height: 68
  },
  label: {
    textAlign: 'center',
    margin: 'auto',
    fontFamily: Font,
    fontSize: 24
  },
  primaryButton: {
    backgroundColor: Colors.button.primary.color,
    borderColor: Colors.button.primary.border
  },
  primaryLabel: {
    color: Colors.button.primary.label
  },
  secondaryButton: {
    borderColor: Colors.button.secondary.border
  },
  secondaryLabel: {
    color: Colors.button.secondary.label
  }
});