import { faEllipsis } from '@fortawesome/free-solid-svg-icons/faEllipsis';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Image, Pressable, StyleSheet, Text, type ImageSourcePropType, type PressableProps } from 'react-native';

import { WhiteBox } from '@/components/white-box';
import { Colors } from '@/constants/theme';

export type HomeEntryProps = PressableProps & {
  imageSrc: ImageSourcePropType,
  label: string
  moreButton?: boolean
};

export function HomeEntry({ imageSrc, label, moreButton, ...rest }: HomeEntryProps) {
    return (
        <Pressable {...rest}>
            <WhiteBox style={styles.groupEntry}>
                <Image
                    source={imageSrc}
                    style={styles.entryIcon}
                />

                <Text style={styles.entryLabel}>
                    { label }
                </Text>

                {moreButton && (
                    <Pressable style={styles.moreButton}>
                        <FontAwesomeIcon icon={faEllipsis} color={Colors.interface.text} size={24} />
                    </Pressable>
                )}
            </WhiteBox>
        </Pressable>
    )
}

const styles = StyleSheet.create({
  groupEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 360,
    padding: 11,
    gap: 18
  },
  entryIcon: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: Colors.box.border
  },
  entryLabel: {
    fontSize: 28
  },
  moreButton: {
    position: "absolute",
    top: 11,
    right: 11
  }
});