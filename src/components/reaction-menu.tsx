import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

type ReactionMenuProps = {
  emojis: string[];
  counts: Record<string, number>;
  selectedEmojis: string[];
  onSelect: (emoji: string) => void;
};

export function ReactionMenu({ emojis, counts, selectedEmojis, onSelect }: ReactionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (emojis.length === 0) return null;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isOpen ? 'Hide reactions' : 'Add reaction'}
        onPress={() => setIsOpen((open) => !open)}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>React</Text>
      </Pressable>
      {isOpen && (
        <View style={styles.menu}>
          {emojis.map((emoji, index) => (
            <Pressable
              key={`${emoji}-${index}`}
              accessibilityLabel={`React with ${emoji}`}
              onPress={() => onSelect(emoji)}
              style={[styles.emojiItem, selectedEmojis.includes(emoji) && styles.selectedEmojiItem]}
            >
              <Text style={styles.emoji}>{emoji}{counts[emoji] ? ` ${counts[emoji]}` : ''}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  trigger: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: Colors.interface.box,
  },
  triggerText: {
    color: Colors.textLink,
    fontSize: 13,
    fontWeight: '600',
  },
  menu: {
    position: 'absolute',
    right: 0,
    bottom: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
    maxWidth: 240,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.box.border,
    backgroundColor: Colors.box.background,
    zIndex: 2,
  },
  emojiItem: {
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedEmojiItem: {
    backgroundColor: Colors.interface.box,
    borderRadius: 18,
  },
  emoji: {
    fontSize: 22,
  },
});
