import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

function getExpoHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;

  return hostUri
    .replace(/^https?:\/\//, '')
    .replace(/^exp:\/\//, '')
    .split('/')[0]
    .split(':')[0];
}

function isLocalNetworkHost(host: string) {
  return (
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    host.endsWith('.local')
  );
}

function getDefaultApiUrl() {
  if (!Device.isDevice) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8010';
    }

    return 'http://127.0.0.1:8010';
  }

  const expoHost = getExpoHost();
  if (expoHost && isLocalNetworkHost(expoHost)) {
    return `http://${expoHost}:8010`;
  }

  return 'http://127.0.0.1:8010';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiUrl();
