import { storage } from '../utils/storage';
import { getApiBaseUrl, getWsBaseUrl } from '../api';

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWsBaseUrl();

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await storage.getItem('access_token');
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = errorBody || response.statusText;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.message) {
          errorMsg = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
        }
      } catch {}
      throw new Error(`API Error (${response.status}): ${errorMsg}`);
    }

    return await response.json();
  } catch (error: any) {
    console.warn(`Network request failed for ${url}:`, error.message);
    throw error;
  }
}
