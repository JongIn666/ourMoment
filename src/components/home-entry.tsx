import { faEllipsis } from '@fortawesome/free-solid-svg-icons/faEllipsis';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type PressableProps } from 'react-native';

import { WhiteBox } from '@/components/white-box';
import { Colors } from '@/constants/theme';

export type HomeEntryProps = PressableProps & {
  imageSrc: ImageSourcePropType,
  label: string,
  description?: string,
  moreButton?: boolean,
  settingButton?: boolean,
  onSettingPress?: () => void,
};

export function HomeEntry({ imageSrc, label, description, moreButton, settingButton, onSettingPress, ...rest }: HomeEntryProps) {
    return (
    <Pressable style={styles.entryPressable} {...rest}>
            <WhiteBox style={styles.groupEntry}>
                <Image
                    source={imageSrc}
                    style={styles.entryIcon}
                />

                <View style={styles.entryText}>
                  <Text style={styles.entryLabel} numberOfLines={1}>
                    { label }
                  </Text>
                  {description ? (
                    <Text style={styles.entryDescription} numberOfLines={2}>
                      {description}
                    </Text>
                  ) : null}
                </View>

                {moreButton && (
                    <Pressable style={styles.button}>
                        <FontAwesomeIcon icon={faEllipsis} color={Colors.interface.text} size={24} />
                    </Pressable>
                )}

                {settingButton && (
                  <Pressable
                    accessibilityLabel={`Edit ${label} settings`}
                    hitSlop={8}
                    onPress={onSettingPress}
                    style={styles.button}
                  >
                        <FontAwesomeIcon icon={faGear} color={Colors.interface.text} size={24} />
                    </Pressable>
                )}
            </WhiteBox>
        </Pressable>
    )
}

const styles = StyleSheet.create({
  entryPressable: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
  },
  groupEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
  entryText: {
    flex: 1,
    gap: 2,
  },
  entryDescription: {
    color: Colors.interface.text,
    fontSize: 14,
  },
  button: {
    position: "absolute",
    top: 11,
    right: 11
  }
});