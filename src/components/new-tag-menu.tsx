import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { TextInputThemed } from "@/components/text-input-themed";
import { Colors } from "@/constants/theme";

type NewTagMenuProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
};

export function NewTagMenu({ visible, onClose, onCreate }: NewTagMenuProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function close() {
    setName("");
    setError(null);
    onClose();
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the tag a name.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onCreate(trimmed);
      close();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create the tag.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>New tag</Text>
          <TextInputThemed
            autoFocus
            maxLength={30}
            onChangeText={setName}
            onSubmitEditing={handleCreate}
            placeholder="Tag name"
            value={name}
          />
          {error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={close}
              style={styles.actionButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={handleCreate}
              style={styles.createButton}
            >
              <Text style={styles.createText}>
                {isSaving ? "Creating…" : "Create"}
              </Text>
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
  error: {
    color: "#9B2C2C",
    fontSize: 14,
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
  cancelText: {
    color: Colors.interface.text,
    fontWeight: "600",
  },
  createButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: Colors.button.primary.color,
  },
  createText: {
    color: Colors.button.primary.label,
    fontWeight: "700",
  },
});
