export const WEATHER_OPTIONS = [
  { value: '', label: 'No weather', emoji: '' },
  { value: 'sunny', label: 'Sunny', emoji: '☀️' },
  { value: 'partly_cloudy', label: 'Partly cloudy', emoji: '⛅' },
  { value: 'cloudy', label: 'Cloudy', emoji: '☁️' },
  { value: 'rainy', label: 'Rainy', emoji: '🌧️' },
  { value: 'stormy', label: 'Stormy', emoji: '⛈️' },
  { value: 'snowy', label: 'Snowy', emoji: '❄️' },
  { value: 'windy', label: 'Windy', emoji: '🌬️' },
  { value: 'foggy', label: 'Foggy', emoji: '🌫️' },
] as const;

export type WeatherValue = (typeof WEATHER_OPTIONS)[number]['value'];

export function getWeatherOption(value: string) {
  return WEATHER_OPTIONS.find((option) => option.value === value) ?? WEATHER_OPTIONS[0];
}
