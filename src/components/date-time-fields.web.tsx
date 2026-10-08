import { createElement, type CSSProperties, type ChangeEvent } from 'react';
import { View } from 'react-native';

import { Colors } from '@/constants/theme';

type DateTimeFieldsProps = {
  value: Date;
  onChange: (value: Date) => void;
};

function formatDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(value: Date) {
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function DateTimeFields({ value, onChange }: DateTimeFieldsProps) {
  function changeDate(event: ChangeEvent<HTMLInputElement>) {
    const dateValue = event.currentTarget.value;
    if (!dateValue) return;
    const [year, month, day] = dateValue.split('-').map(Number);
    const updated = new Date(value);
    updated.setFullYear(year, month - 1, day);
    onChange(updated);
  }

  function changeTime(event: ChangeEvent<HTMLInputElement>) {
    const timeValue = event.currentTarget.value;
    if (!timeValue) return;
    const [hours, minutes] = timeValue.split(':').map(Number);
    const updated = new Date(value);
    updated.setHours(hours, minutes, 0, 0);
    onChange(updated);
  }

  const dateInput = createElement('input', {
    'aria-label': 'Post date',
    type: 'date',
    value: formatDate(value),
    onChange: changeDate,
    style: styles.input,
  });
  const timeInput = createElement('input', {
    'aria-label': 'Post time',
    type: 'time',
    value: formatTime(value),
    onChange: changeTime,
    style: styles.input,
  });

  return (
    <View style={styles.fields}>
      {createElement('label', { style: styles.field }, createElement('span', { style: styles.label }, 'Date'), dateInput)}
      {createElement('label', { style: styles.field }, createElement('span', { style: styles.label }, 'Time'), timeInput)}
    </View>
  );
}

const styles: Record<string, CSSProperties> = {
  fields: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 64,
    gap: 4,
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
  input: {
    width: '100%',
    boxSizing: 'border-box',
    borderWidth: 0,
    padding: 0,
    color: Colors.heading,
    backgroundColor: 'transparent',
    fontSize: 16,
    fontWeight: 600,
  },
};
