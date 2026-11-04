import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { getWeatherOption, WEATHER_OPTIONS, type WeatherValue } from '@/lib/weather';

type WeatherMenuProps = {
  value: string;
  onChange: (weather: WeatherValue) => void;
  disabled?: boolean;
};

export function WeatherMenu({ value, onChange, disabled = false }: WeatherMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = getWeatherOption(value);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose weather"
        disabled={disabled}
        onPress={() => setIsOpen((open) => !open)}
        style={[styles.trigger, disabled && styles.disabled]}
      >
        <Text style={styles.triggerText}>
          {selected.value ? `${selected.emoji} ${selected.label}` : 'Choose weather'}
        </Text>
        <Text style={styles.chevron}>{isOpen ? '⌃' : '⌄'}</Text>
      </Pressable>
      {isOpen && !disabled && (
        <View style={styles.menu}>
          {WEATHER_OPTIONS.map((option) => (
            <Pressable
              key={option.value || 'none'}
              accessibilityRole="button"
              onPress={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={[styles.option, option.value === value && styles.selectedOption]}
            >
              <Text style={styles.optionText}>
                {option.emoji ? `${option.emoji} ${option.label}` : option.label}
              </Text>
              {option.value === value && <Text style={styles.check}>✓</Text>}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    zIndex: 10,
    elevation: 10,
  },
  trigger: {
    minWidth: 170,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.box.border,
    backgroundColor: Colors.interface.box,
  },
  disabled: {
    opacity: 0.55,
  },
  triggerText: {
    color: Colors.interface.text,
    fontSize: 15,
  },
  chevron: {
    color: Colors.interface.text,
    fontSize: 16,
  },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: 220,
    borderWidth: 1,
    borderColor: Colors.box.border,
    backgroundColor: Colors.box.background,
    zIndex: 11,
    elevation: 11,
  },
  option: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedOption: {
    backgroundColor: Colors.interface.box,
  },
  optionText: {
    color: Colors.interface.text,
    fontSize: 14,
  },
  check: {
    color: Colors.textLink,
    fontWeight: '700',
  },
});
