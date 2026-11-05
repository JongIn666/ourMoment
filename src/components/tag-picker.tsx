import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import type { Tag } from "@/lib/auth-api";

type TagPickerProps = {
  tags: Tag[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
};

export function TagPicker({
  tags,
  selectedIds,
  onChange,
  disabled,
}: TagPickerProps) {
  if (tags.length === 0) {
    return <Text style={styles.empty}>No tags in this group yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {tags.map((tag) => {
        const isSelected = selectedIds.includes(tag.id);
        return (
          <Pressable
            key={tag.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            disabled={disabled}
            onPress={() =>
              onChange(
                isSelected
                  ? selectedIds.filter((id) => id !== tag.id)
                  : [...selectedIds, tag.id],
              )
            }
            style={[
              styles.tag,
              !!tag.color && { borderColor: tag.color },
              isSelected && styles.tagSelected,
            ]}
          >
            <Text
              style={[styles.tagText, isSelected && styles.tagTextSelected]}
            >
              #{tag.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderRadius: 16,
    borderColor: Colors.box.border,
  },
  tagSelected: {
    backgroundColor: Colors.button.primary.color,
    borderColor: Colors.button.primary.border,
  },
  tagText: {
    color: Colors.interface.text,
  },
  tagTextSelected: {
    color: Colors.button.primary.label,
    fontWeight: "700",
  },
  empty: {
    color: Colors.interface.text,
  },
});
