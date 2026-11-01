import React from 'react';
import {
  Alert,
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
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

export default function AuthScreen() {
  const { authMode, setAuthMode, submitAuth, authBusy } = useAuth();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const isRegister = authMode === 'register';

  async function handleSubmit() {
    if (
      !email.includes('@') ||
      password.length < 8 ||
      (isRegister && name.trim().length < 2)
    ) {
      Alert.alert(
        'Check your details',
        'Enter a valid email and a password with at least 8 characters.',
      );
      return;
    }
    try {
      await submitAuth(email.trim(), password, name.trim());
    } catch (error) {
      Alert.alert(
        'Could not sign in',
        error instanceof Error
          ? error.message
          : 'Check your connection and try again.',
      );
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={s.frame}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand */}
          <View style={s.brand}>
            <View style={s.brandMark}>
              <Text style={s.brandMarkText}>S</Text>
              <View style={s.brandDot} />
            </View>
            <View>
              <Text style={s.brandName}>
                Sport<Text style={s.brandGold}>LK</Text>
              </Text>
              <Text style={s.brandTag}>YOUR GAME. YOUR PEOPLE.</Text>
            </View>
          </View>

          {/* Illustration */}
          <View style={s.illustration}>
            <View style={s.circle}>
              <Text style={s.ball}>S</Text>
            </View>
            <Text style={s.stars}>✦     ·      ✦</Text>
          </View>

          <Text style={s.eyebrow}>
            {isRegister ? 'WELCOME TO YOUR COMMUNITY' : 'GOOD TO SEE YOU AGAIN'}
          </Text>
          <Text style={s.title}>
            {isRegister ? 'Find your people.' : 'Ready when you are.'}
          </Text>
          <Text style={s.subtitle}>
            {isRegister
              ? 'One home for every game, every team, and every win.'
              : 'Your teams, communities, and next game are waiting.'}
          </Text>

          {/* Form */}
          <View style={s.form}>
            {isRegister && (
              <>
                <Text style={s.label}>YOUR NAME</Text>
                <TextInput
                  style={s.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Nethmi Perera"
                  placeholderTextColor={COLORS.placeholder}
                  autoCapitalize="words"
                />
              </>
            )}
            <Text style={s.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={s.label}>PASSWORD</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={COLORS.placeholder}
              secureTextEntry
            />
            <Pressable
              style={[s.submit, authBusy && s.submitDisabled]}
              disabled={authBusy}
              onPress={handleSubmit}
            >
              <Text style={s.submitText}>
                {authBusy
                  ? 'Connecting…'
                  : isRegister
                  ? 'Create your account'
                  : 'Sign in'}{' '}
                →
              </Text>
            </Pressable>
          </View>

          <View style={s.switchRow}>
            <Text style={s.switchText}>
              {isRegister
                ? 'Already part of the community?'
                : 'New to SportLK?'}
            </Text>
            <Pressable
              onPress={() =>
                setAuthMode(isRegister ? 'login' : 'register')
              }
            >
              <Text style={s.switchAction}>
                {isRegister ? ' Sign in' : ' Create an account'}
              </Text>
            </Pressable>
          </View>

          <Text style={s.legal}>
            By continuing, you agree to our{' '}
            <Text style={s.legalStrong}>Terms</Text> and{' '}
            <Text style={s.legalStrong}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F4EF' },
  frame: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 18,
    justifyContent: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 21,
  },
  brandMark: {
    width: 34, height: 34, borderWidth: 1, borderColor: '#D4B568',
    borderRadius: 10, backgroundColor: '#F2EBD8', alignItems: 'center',
    justifyContent: 'center', position: 'relative',
  },
  brandMarkText: { color: '#17253A', fontSize: 19, fontWeight: '900', fontStyle: 'italic' },
  brandDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4B568',
    position: 'absolute', right: 5, bottom: 5,
  },
  brandName: { color: '#17253A', fontSize: 18, fontWeight: '800', letterSpacing: -0.7 },
  brandGold: { color: '#B28A3D' },
  brandTag: { color: '#9A9588', fontSize: 7, letterSpacing: 1.1, marginTop: 1, fontWeight: '700' },
  illustration: {
    height: 126, borderRadius: 14, backgroundColor: '#1A2A3F',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    marginBottom: 21, position: 'relative',
  },
  circle: {
    width: 81, height: 81, borderWidth: 1, borderColor: '#D5B568',
    borderRadius: 41, backgroundColor: 'rgba(214,183,108,.12)',
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  ball: { color: '#E2C476', fontSize: 48, fontWeight: '900', fontStyle: 'italic' },
  stars: { position: 'absolute', bottom: 15, color: '#D4B66E', fontSize: 10, letterSpacing: 5 },
  eyebrow: { color: '#A1864C', fontSize: 8, letterSpacing: 1.1, fontWeight: '800' },
  title: { marginTop: 6, color: '#1D2A3A', fontSize: 25, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { marginTop: 5, color: '#88929B', fontSize: 10, lineHeight: 15 },
  form: { marginTop: 19 },
  label: { marginTop: 12, marginBottom: 6, color: '#777F84', fontSize: 8, letterSpacing: 0.8, fontWeight: '800' },
  input: {
    minHeight: 41, borderWidth: 1, borderColor: '#E6E3DC', borderRadius: 7,
    backgroundColor: '#FFF', paddingHorizontal: 11, color: '#354254', fontSize: 10,
  },
  submit: {
    height: 43, marginTop: 18, alignItems: 'center', justifyContent: 'center',
    borderRadius: 7, backgroundColor: '#26384F',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  switchText: { color: '#929AA0', fontSize: 9 },
  switchAction: { color: '#8C7038', fontSize: 9, fontWeight: '700' },
  legal: { marginTop: 21, color: '#A5AAA9', fontSize: 8, textAlign: 'center' },
  legalStrong: { color: '#7A8387', fontWeight: '700' },
});
