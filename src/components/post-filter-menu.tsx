import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { emptyFilters, type PostFilters } from "@/lib/post-filters";

type PostFilterMenuProps = {
  visible: boolean;
  filters: PostFilters;
  onChange: (filters: PostFilters) => void;
  onClose: () => void;
};

export function PostFilterMenu({
  visible,
  filters,
  onChange,
  onClose,
}: PostFilterMenuProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Filter Posts</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Photos and videos only</Text>
            <Switch
              value={filters.mediaOnly}
              onValueChange={(mediaOnly) => onChange({ ...filters, mediaOnly })}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onChange(emptyFilters)}
              style={styles.actionButton}
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
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
    gap: 16,
    padding: 22,
    borderRadius: 12,
    backgroundColor: Colors.box.background,
  },
  title: {
    color: Colors.heading,
    fontSize: 20,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: Colors.interface.text,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  clearText: {
    color: Colors.interface.text,
    fontWeight: "600",
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
