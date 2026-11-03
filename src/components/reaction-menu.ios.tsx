import { Button, Host, Menu } from '@expo/ui/swift-ui';
import { StyleSheet } from 'react-native';

type ReactionMenuProps = {
  emojis: string[];
  counts: Record<string, number>;
  selectedEmojis: string[];
  onSelect: (emoji: string) => void;
};

export function ReactionMenu({ emojis, counts, selectedEmojis, onSelect }: ReactionMenuProps) {
  if (emojis.length === 0) return null;

  return (
    <Host matchContents style={styles.host}>
      <Menu label="React" systemImage="face.smiling">
        {emojis.map((emoji, index) => (
          <Button
            key={`${emoji}-${index}`}
            label={`${emoji}${counts[emoji] ? ` ${counts[emoji]}` : ''}${selectedEmojis.includes(emoji) ? ' ✓' : ''}`}
            onPress={() => onSelect(emoji)}
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
