import { Button, Host, Menu } from '@expo/ui/swift-ui';
import { StyleSheet } from 'react-native';

export function ReactionMenu({ emojis }: { emojis: string[] }) {
  if (emojis.length === 0) return null;

  return (
    <Host matchContents style={styles.host}>
      <Menu label="React" systemImage="face.smiling">
        {emojis.map((emoji, index) => (
          <Button
            key={`${emoji}-${index}`}
            label={emoji}
            onPress={() => {}}
          />
        ))}
      </Menu>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    alignSelf: 'flex-end',
  },
});
