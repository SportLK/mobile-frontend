import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import AuthScreen from '../src/screens/AuthScreen';

/**
 * Root layout — wraps everything in AuthProvider.
 * The auth gate sits here: if not authenticated, show AuthScreen.
 * This matches Expo Router's recommended pattern for auth flows.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AuthGate() {
  const { authenticated } = useAuth();
  if (!authenticated) return <AuthScreen />;
  // When authenticated, render the (tabs) stack
  return <Stack screenOptions={{ headerShown: false }} />;
}
