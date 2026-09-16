import { Platform } from 'react-native';

const defaultApiUrl = Platform.select({
  android: 'http://10.0.2.2:8010',
  default: 'http://127.0.0.1:8010',
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;
