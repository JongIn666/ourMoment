import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { faComment } from '@fortawesome/free-solid-svg-icons/faComment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { Colors } from '@/constants/theme';
import { type Emoji } from './emoji';

export type ReactButtonProps = PressableProps & {
  type: 'comment' | 'emoji';
  count: number;
  emoji?: Emoji
};

export function ReactButton({type, count, emoji} : ReactButtonProps) {
    return (
        <Pressable style={styles.reactView}>
            { type == 'comment' && (
                <FontAwesomeIcon icon={faComment} color={Colors.interface.text} size={16} />
            )}
            { type == 'emoji' && emoji?.type == 'unicode' && (
                <Text style={styles.reactLabel}>
                    { emoji.unicode }
                </Text>
            )}
            <Text style={styles.reactLabel}>
                { count }
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
  reactView: {
    backgroundColor: Colors.interface.box,
    height: 30,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  reactLabel: {
    fontSize: 16
  }
});