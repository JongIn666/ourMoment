import type { GroupMember } from "@/lib/auth-api";
import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { emptyFilters, type PostFilters } from "@/lib/post-filters";

import DateTimePicker, {
    type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform } from "react-native";

import { WEATHER_OPTIONS } from "@/lib/weather";

type PostFilterMenuProps = {
  visible: boolean;
  filters: PostFilters;
  members?: GroupMember[];
  onChange: (filters: PostFilters) => void;
  onClose: () => void;
};

type DateButtonProps = {
  label: string;
  value: Date | null;
  onPress: () => void;
  onClear: () => void;
};

function DateButton({ label, value, onPress, onClear }: DateButtonProps) {
  return (
    <View style={styles.dateField}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={styles.dateButton}
      >
        <Text style={styles.dateLabel}>{label}</Text>
        <Text style={styles.dateValue}>
          {value ? value.toLocaleDateString() : "Any"}
        </Text>
      </Pressable>
      {value && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Clear ${label} date`}
          onPress={onClear}
        >
          <Text style={styles.clearDateText}>Clear</Text>
        </Pressable>
      )}
    </View>
  );
}

export function PostFilterMenu({
  visible,
  filters,
  members,
  onChange,
  onClose,
}: PostFilterMenuProps) {
  const [editingDate, setEditingDate] = useState<"from" | "to" | null>(null);

  function handleDateChange(event: DateTimePickerEvent, selected?: Date) {
    const field = editingDate;
    if (Platform.OS !== "ios") setEditingDate(null);
    if (event.type === "dismissed" || !field || !selected) return;
    onChange(
      field === "from"
        ? { ...filters, from: selected }
        : { ...filters, to: selected },
    );
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
          <Text style={styles.title}>Filter Posts</Text>

          {members && members.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Posted by</Text>
              <View style={styles.memberList}>
                {members.map((member) => {
                  const isSelected = filters.authorId === member.id;
                  return (
                    <Pressable
                      key={member.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() =>
                        onChange({
                          ...filters,
                          authorId: isSelected ? null : member.id,
                        })
                      }
                      style={[
                        styles.memberButton,
                        isSelected && styles.memberButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.memberButtonText,
                          isSelected && styles.memberButtonTextSelected,
                        ]}
                      >
                        {member.profile.displayName
                          ? `${member.profile.displayName} (@${member.username})`
                          : member.username}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Date range</Text>
            <View style={styles.dateRow}>
              <DateButton
                label="From"
                value={filters.from}
                onPress={() => setEditingDate("from")}
                onClear={() => onChange({ ...filters, from: null })}
              />
              <DateButton
                label="To"
                value={filters.to}
                onPress={() => setEditingDate("to")}
                onClear={() => onChange({ ...filters, to: null })}
              />
            </View>
            {editingDate && (
              <View>
                <DateTimePicker
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  value={filters[editingDate] ?? new Date()}
                  onChange={handleDateChange}
                />
                {Platform.OS === "ios" && (
                  <Pressable
                    onPress={() => setEditingDate(null)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.clearText}>Done</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Photos and videos only</Text>
            <Switch
              value={filters.mediaOnly}
              onValueChange={(mediaOnly) => onChange({ ...filters, mediaOnly })}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Weather</Text>
            <View style={styles.memberList}>
              {WEATHER_OPTIONS.filter((option) => option.value !== "").map(
                (option) => {
                  const isSelected = filters.weather === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() =>
                        onChange({
                          ...filters,
                          weather: isSelected ? null : option.value,
                        })
                      }
                      style={[
                        styles.memberButton,
                        isSelected && styles.memberButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.memberButtonText,
                          isSelected && styles.memberButtonTextSelected,
                        ]}
                      >
                        {option.emoji} {option.label}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>
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
  section: {
    gap: 8,
  },
  memberList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  memberButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderRadius: 16,
    borderColor: Colors.box.border,
  },
  memberButtonSelected: {
    backgroundColor: Colors.button.primary.color,
    borderColor: Colors.button.primary.border,
  },
  memberButtonText: {
    color: Colors.interface.text,
  },
  memberButtonTextSelected: {
    color: Colors.button.primary.label,
    fontWeight: "700",
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateField: {
    flex: 1,
    gap: 4,
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.interface.border,
    backgroundColor: Colors.box.background,
  },
  dateLabel: {
    color: Colors.interface.text,
    fontSize: 12,
  },
  dateValue: {
    color: Colors.heading,
    fontSize: 16,
    fontWeight: "600",
  },
  clearDateText: {
    color: Colors.textLink,
    fontSize: 13,
  },
});
