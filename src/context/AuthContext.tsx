import { storage } from '../utils/storage';
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
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userCity, setUserCity] = useState('');
  const [roles, setRoles] = useState<Workspace[]>(['player']);
  const [workspace, setWorkspace] = useState<Workspace>('player');
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Restore tokens from secure storage on app start
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await storage.getItem('access_token');
        const refresh = await storage.getItem('refresh_token');
        if (token) {
          setAccessToken(token);
          setRefreshToken(refresh ?? undefined);
          setAuthenticated(true);
          // Fetch live user profile
          const profile = await apiRequest<{
            id: string;
            displayName: string;
            email: string;
            roles: string[];
            city?: string | null;
          }>('/users/me', {}, token);
          setUserName(profile.displayName || 'Player');
          setUserEmail(profile.email || '');
          setUserCity(profile.city ?? '');
          const filteredRoles = (profile.roles || []).filter(
            (r): r is Workspace => r !== 'admin',
          );
          if (filteredRoles.length > 0) {
            setRoles(filteredRoles);
            setWorkspace(filteredRoles[0]);
          }
        } else {
          setAuthenticated(false);
        }
      } catch {
        setAuthenticated(false);
      }
    }
    restoreSession();
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
        await storage.setItem('access_token', session.accessToken);
        await storage.setItem('refresh_token', session.refreshToken);
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
                ? { email: email.trim(), password }
                : { email: email.trim(), password, displayName: name.trim() },
            ),
          },
        );
        await storage.setItem('access_token', response.accessToken);
        await storage.setItem('refresh_token', response.refreshToken);
        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setUserName(response.user.displayName);
        setUserEmail(response.user.email);
        setUserCity(response.user.city ?? '');
        const filteredRoles = response.user.roles.filter(
          (r): r is Workspace => r !== 'admin',
        );
        setRoles(filteredRoles.length > 0 ? filteredRoles : ['player']);
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
    storage.deleteItem('access_token');
    storage.deleteItem('refresh_token');
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
