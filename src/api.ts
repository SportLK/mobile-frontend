import { Platform } from 'react-native';
import Constants from 'expo-constants';

declare const process: { env: Record<string, string | undefined> };

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Auto-detect host machine IP when running via Expo Go on physical device or simulator
  const debuggerHost = Constants.expoConfig?.hostUri;
  const hostAddress = debuggerHost ? debuggerHost.split(':')[0] : null;

  if (hostAddress) {
    return `http://${hostAddress}:3000/api/v1`;
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';
}

export function getWsBaseUrl(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body.message === 'string'
        ? body.message
        : Array.isArray(body.message)
        ? body.message.join(', ')
        : 'Something went wrong. Please try again.';
    throw new Error(message);
  }
  return body as T;
}

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: ('player' | 'team_manager' | 'organizer' | 'admin')[];
    sports: string[];
    city?: string | null;
    bio?: string | null;
  };
};
