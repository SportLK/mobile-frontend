import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const LOGO_IMAGE = require('../../assets/logo.jpeg');

interface AuthScreenProps {
  onBack?: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthScreen({ onBack, initialMode }: AuthScreenProps) {
  const { authMode, setAuthMode, submitAuth, authBusy } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sync initial mode if provided
  useEffect(() => {
    if (initialMode && initialMode !== authMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  const isRegister = authMode === 'register';

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert(
        'Password Too Short',
        'Your password must be at least 8 characters long.',
      );
      return;
    }
    if (isRegister && name.trim().length < 2) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }

    try {
      await submitAuth(trimmedEmail, password, name.trim());
    } catch (error) {
      Alert.alert(
        'Authentication Failed',
        error instanceof Error
          ? error.message
          : 'Could not connect to the backend server. Check your connection.',
      );
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={s.frame}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.scrollView}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar: Optional Back Button + Brand Pill */}
          <View style={s.topNav}>
            {onBack ? (
              <Pressable
                onPress={onBack}
                style={({ pressed }) => [s.backBtn, pressed && s.btnPressed]}
                hitSlop={12}
              >
                <Text style={s.backBtnText}>‹ Back</Text>
              </Pressable>
            ) : (
              <View style={s.backPlaceholder} />
            )}

            <View style={s.networkPill}>
              <View style={s.networkDot} />
              <Text style={s.networkText}>SPORTLK OFFICIAL</Text>
            </View>
          </View>

          {/* Compact Brand Header with Official Logo */}
          <View style={s.brandHeader}>
            <View style={s.brandMark}>
              <Image
                source={LOGO_IMAGE}
                style={s.brandLogoImg}
                resizeMode="contain"
              />
            </View>
            <View style={s.brandMeta}>
              <Text style={s.brandName}>
                Sport<Text style={s.brandGold}>LK</Text>
              </Text>
              <Text style={s.brandTag}>PERFORMANCE · UNITY · EXCELLENCE</Text>
            </View>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={s.modeSwitcher}>
            <Pressable
              style={[s.modeTab, !isRegister && s.modeTabActive]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[s.modeTabText, !isRegister && s.modeTabTextActive]}>
                Sign In
              </Text>
            </Pressable>

            <Pressable
              style={[s.modeTab, isRegister && s.modeTabActive]}
              onPress={() => setAuthMode('register')}
            >
              <Text style={[s.modeTabText, isRegister && s.modeTabTextActive]}>
                Create Account
              </Text>
            </Pressable>
          </View>

          {/* Heading Text */}
          <View style={s.headingBlock}>
            <Text style={s.title}>
              {isRegister ? 'Join the community.' : 'Welcome back.'}
            </Text>
            <Text style={s.subtitle}>
              {isRegister
                ? 'Create a player profile to join tournaments and book venues.'
                : 'Sign in with your credentials to access your sports hub.'}
            </Text>
          </View>

          {/* Input Form */}
          <View style={s.form}>
            {isRegister && (
              <View style={s.fieldGroup}>
                <Text style={s.label}>FULL NAME</Text>
                <TextInput
                  style={s.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Kasun Fernando"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={s.fieldGroup}>
              <Text style={s.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>PASSWORD</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                s.submitBtn,
                authBusy && s.submitBtnDisabled,
                pressed && s.submitBtnPressed,
              ]}
              disabled={authBusy}
              onPress={handleSubmit}
            >
              {authBusy ? (
                <View style={s.busyRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={s.submitText}>
                    {isRegister ? 'Creating Account…' : 'Connecting…'}
                  </Text>
                </View>
              ) : (
                <Text style={s.submitText}>
                  {isRegister ? 'Create Account →' : 'Sign In →'}
                </Text>
              )}
            </Pressable>
          </View>

          {/* Toggle Switch Prompt */}
          <View style={s.switchRow}>
            <Text style={s.switchText}>
              {isRegister
                ? 'Already have an account?'
                : 'New to SportLK?'}
            </Text>
            <Pressable
              onPress={() => setAuthMode(isRegister ? 'login' : 'register')}
              hitSlop={8}
            >
              <Text style={s.switchAction}>
                {isRegister ? ' Sign in' : ' Create an account'}
              </Text>
            </Pressable>
          </View>

          {/* Terms & Privacy */}
          <Text style={s.legal}>
            By continuing, you agree to SportLK's{' '}
            <Text style={s.legalStrong}>Terms of Service</Text> and{' '}
            <Text style={s.legalStrong}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EEF0F2',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  backPlaceholder: {
    width: 40,
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  networkText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#065F46',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  brandLogoImg: {
    width: '100%',
    height: '100%',
  },
  brandMeta: {
    justifyContent: 'center',
  },
  brandName: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  brandGold: {
    color: '#B28A3D',
  },
  brandTag: {
    color: '#9CA3AF',
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 2,
    fontWeight: '800',
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeTabTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  headingBlock: {
    marginBottom: 20,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },
  submitBtn: {
    height: 48,
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnPressed: {
    backgroundColor: '#047857',
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },
  switchText: {
    color: '#6B7280',
    fontSize: 13,
  },
  switchAction: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  legal: {
    marginTop: 24,
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
  },
  legalStrong: {
    color: '#4B5563',
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.7,
  },
});
