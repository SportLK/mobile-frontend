import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import SplashScreen from '../src/screens/SplashScreen';
import IntroScreen from '../src/screens/IntroScreen';
import AuthScreen from '../src/screens/AuthScreen';

/**
 * Root layout — wraps everything in AuthProvider and manages the
 * seamless 3-stage user journey:
 * 1. SplashScreen (White page + SportLK logo + animated loading bar)
 * 2. IntroScreen (Full-screen real sports imagery + app highlights + Get Started)
 * 3. AuthScreen (Clean, responsive Login / Register form)
 * 4. MainApp (Authenticated user dashboard)
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
  const { authenticated, setAuthMode } = useAuth();
  const [isSplash, setIsSplash] = useState(true);
  const [introStep, setIntroStep] = useState<'intro' | 'auth'>('intro');

  // 1. Initial Splash Screen with Logo and Loading Bar
  if (isSplash) {
    return <SplashScreen onFinish={() => setIsSplash(false)} />;
  }

  // 2. Main Authenticated Experience
  if (authenticated) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  // 3. Intro / Onboarding Screen with Full-Screen Sports Image
  if (introStep === 'intro') {
    return (
      <IntroScreen
        onGetStarted={() => {
          setAuthMode('register');
          setIntroStep('auth');
        }}
        onSignIn={() => {
          setAuthMode('login');
          setIntroStep('auth');
        }}
      />
    );
  }

  // 4. Responsive Login / Register Screen
  return (
    <AuthScreen
      onBack={() => setIntroStep('intro')}
    />
  );
}
