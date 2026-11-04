import { Button, Host, Menu } from '@expo/ui/swift-ui';
import { disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet } from 'react-native';

import { getWeatherOption, WEATHER_OPTIONS, type WeatherValue } from '@/lib/weather';

type WeatherMenuProps = {
  value: string;
  onChange: (weather: WeatherValue) => void;
  disabled?: boolean;
};

export function WeatherMenu({ value, onChange, disabled = false }: WeatherMenuProps) {
  const selected = getWeatherOption(value);
  const label = selected.value ? `${selected.emoji} ${selected.label}` : 'Weather';

  return (
    <Host matchContents style={styles.host}>
      <Menu
        label={label}
        systemImage="cloud.sun"
        modifiers={disabled ? [disabledModifier(true)] : undefined}
      >
        {WEATHER_OPTIONS.map((option) => (
          <Button
            key={option.value || 'none'}
            label={`${option.emoji ? `${option.emoji} ` : ''}${option.label}${option.value === value ? ' ✓' : ''}`}
            onPress={() => onChange(option.value)}
          />
        ))}
      </Menu>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    alignSelf: 'flex-start',
  },
});
