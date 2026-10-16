import { Platform } from 'react-native';

// Set EXPO_PUBLIC_API_URL in .env to override (physical device / production)
const emulatorUrl =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

function apiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? emulatorUrl;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body.message === 'string'
        ? body.message
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
