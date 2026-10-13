import { Platform } from 'react-native';

// Android emulator maps 10.0.2.2 to host machine's localhost; iOS uses localhost
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api/v1',
  ios: 'http://localhost:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
});

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error (${response.status}): ${errorBody || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.warn(`Network request failed for ${url}:`, error.message);
    throw error;
  }
}
