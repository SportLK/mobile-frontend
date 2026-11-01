import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiRequest, AuthResponse } from '../api';
import { Workspace } from '../types';

type AuthState = {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  userName: string;
  userEmail: string;
  userCity: string;
  roles: Workspace[];
  workspace: Workspace;
  authenticated: boolean;
  authBusy: boolean;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  setWorkspace: (w: Workspace) => void;
  submitAuth: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  setUserName: (name: string) => void;
  setUserCity: (city: string) => void;
  setRoles: (roles: Workspace[]) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [refreshToken, setRefreshToken] = useState<string | undefined>();
  const [userName, setUserName] = useState('Tharindu Jayawardena');
  const [userEmail, setUserEmail] = useState('tharindu@email.com');
  const [userCity, setUserCity] = useState('Colombo');
  const [roles, setRoles] = useState<Workspace[]>(['player']);
  const [workspace, setWorkspace] = useState<Workspace>('player');
  const [authenticated, setAuthenticated] = useState(true); // demo mode on
  const [authBusy, setAuthBusy] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Restore tokens from secure storage on app start
  useEffect(() => {
    SecureStore.getItemAsync('access_token').then((token) => {
      if (token) setAccessToken(token);
    });
    SecureStore.getItemAsync('refresh_token').then((token) => {
      if (token) setRefreshToken(token);
    });
  }, []);

  // Auto-refresh access token ~1 min before it expires (15 min TTL)
  useEffect(() => {
    if (!refreshToken) return;
    const timer = setTimeout(async () => {
      try {
        const session = await apiRequest<AuthResponse>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
        setAccessToken(session.accessToken);
        setRefreshToken(session.refreshToken);
        await SecureStore.setItemAsync('access_token', session.accessToken);
        await SecureStore.setItemAsync('refresh_token', session.refreshToken);
      } catch {
        handleSignOut();
      }
    }, 14 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [accessToken, refreshToken]);

  const submitAuth = useCallback(
    async (email: string, password: string, name: string) => {
      setAuthBusy(true);
      try {
        const response = await apiRequest<AuthResponse>(
          authMode === 'login' ? '/auth/login' : '/auth/register',
          {
            method: 'POST',
            body: JSON.stringify(
              authMode === 'login'
                ? { email, password }
                : { email, password, displayName: name },
            ),
          },
        );
        await SecureStore.setItemAsync('access_token', response.accessToken);
        await SecureStore.setItemAsync('refresh_token', response.refreshToken);
        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setUserName(response.user.displayName);
        setUserEmail(response.user.email);
        setUserCity(response.user.city ?? '');
        const filteredRoles = response.user.roles.filter(
          (r): r is Workspace => r !== 'admin',
        );
        setRoles(filteredRoles);
        setWorkspace(filteredRoles[0] ?? 'player');
        setAuthenticated(true);
      } finally {
        setAuthBusy(false);
      }
    },
    [authMode],
  );

  function handleSignOut() {
    if (accessToken) {
      apiRequest('/auth/logout', { method: 'POST' }, accessToken).catch(
        () => undefined,
      );
    }
    SecureStore.deleteItemAsync('access_token');
    SecureStore.deleteItemAsync('refresh_token');
    setAccessToken(undefined);
    setRefreshToken(undefined);
    setAuthenticated(false);
    setAuthMode('login');
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        userName,
        userEmail,
        userCity,
        roles,
        workspace,
        authenticated,
        authBusy,
        authMode,
        setAuthMode,
        setWorkspace,
        submitAuth,
        signOut: handleSignOut,
        setUserName,
        setUserCity,
        setRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
