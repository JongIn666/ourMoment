import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import type { Tag } from "@/lib/auth-api";

export const TAG_COLORS = [
  "#FFE8B0",
  "#FFD6D6",
  "#D6ECFF",
  "#DFF5D8",
  "#EADCFF",
  "#FFE0C2",
  "#D9F2EE",
  "#F2E8DC",
];

type TagColorMenuProps = {
  visible: boolean;
  tags: Tag[];
  onClose: () => void;
  onColorChange: (tag: Tag, color: string) => Promise<void>;
};

export function TagColorMenu({
  visible,
  tags,
  onClose,
  onColorChange,
}: TagColorMenuProps) {
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function chooseColor(tag: Tag, color: string) {
    setError(null);
    try {
      await onColorChange(tag, color);
      setEditingTagId(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save the color.",
      );
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Tag colors</Text>

          {tags.length === 0 ? (
            <Text style={styles.empty}>
              No tags yet. Create one with the tag icon.
            </Text>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.list}
            >
              {tags.map((tag) => (
                <View key={tag.id} style={styles.tagBlock}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Change color for ${tag.name}`}
                    onPress={() =>
                      setEditingTagId(editingTagId === tag.id ? null : tag.id)
                    }
                    style={styles.tagRow}
                  >
                    <Text style={styles.tagName}>#{tag.name}</Text>
                    <View
                      style={[
                        styles.swatch,
                        { backgroundColor: tag.color || Colors.box.background },
                      ]}
                    />
                  </Pressable>

                  {editingTagId === tag.id && (
                    <View style={styles.palette}>
                      {TAG_COLORS.map((color) => (
                        <Pressable
                          key={color}
                          accessibilityRole="button"
                          accessibilityLabel={`Use color ${color}`}
                          onPress={() => chooseColor(tag, color)}
                          style={[
                            styles.swatch,
                            { backgroundColor: color },
                            tag.color === color && styles.swatchSelected,
                          ]}
                        />
                      ))}
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => chooseColor(tag, "")}
                        style={styles.noneButton}
                      >
                        <Text style={styles.noneText}>None</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          {error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.doneButton}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
    gap: 14,
    padding: 22,
    borderRadius: 12,
    backgroundColor: Colors.box.background,
  },
  title: {
    color: Colors.heading,
    fontSize: 20,
    fontWeight: "700",
  },
  empty: {
    color: Colors.interface.text,
  },
  scroll: {
    flexShrink: 1,
  },
  list: {
    gap: 12,
  },
  tagBlock: {
    gap: 8,
  },
  tagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagName: {
    color: Colors.interface.text,
    fontSize: 16,
  },
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.box.border,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: Colors.heading,
  },
  noneButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  noneText: {
    color: Colors.interface.text,
  },
  error: {
    color: "#9B2C2C",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  doneButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: Colors.button.primary.color,
  },
  doneText: {
    color: Colors.button.primary.label,
    fontWeight: "700",
  },
});
