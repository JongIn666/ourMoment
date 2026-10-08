import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

type PickerMode = 'date' | 'time';

type DateTimeFieldsProps = {
  value: Date;
  onChange: (value: Date) => void;
};

export function DateTimeFields({ value, onChange }: DateTimeFieldsProps) {
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);

  function handlePickerChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === 'dismissed') {
      setPickerMode(null);
      return;
    }
    if (selectedDate) onChange(selectedDate);
    if (Platform.OS !== 'ios') setPickerMode(null);
  }

  return (
    <>
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={() => setPickerMode('date')}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{value.toLocaleDateString()}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => setPickerMode('time')}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
        </Pressable>
      </View>
      {pickerMode && (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            mode={pickerMode}
            onChange={handlePickerChange}
            value={value}
          />
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setPickerMode(null)} style={styles.done}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.interface.border,
    backgroundColor: Colors.box.background,
  },
  label: {
    color: Colors.interface.text,
    fontSize: 12,
  },
  value: {
    color: Colors.heading,
    fontSize: 17,
    fontWeight: '600',
  },
  pickerWrap: {
    alignItems: 'center',
  },
  done: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneText: {
    color: Colors.textLink,
    fontSize: 16,
    fontWeight: '700',
  },
});
