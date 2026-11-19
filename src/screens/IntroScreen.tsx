import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface IntroScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Local high-resolution real sports image with online CDN fallback
const SPORTS_BG_IMAGE = require('../../assets/images/onboarding-sports.jpg');
const LOGO_IMAGE = require('../../assets/logo.jpeg');
const REMOTE_FALLBACK_URL =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1080&h=1920&fit=crop';

export default function IntroScreen({ onGetStarted, onSignIn }: IntroScreenProps) {
  return (
    <View style={s.root}>
      {/* Translucent light status bar so background flows underneath */}
      <StatusBar style="light" />

      {/* 100% Full-Screen Real Sports Photography (No AI, Zero Gaps/Blue) */}
      <Image
        source={SPORTS_BG_IMAGE || { uri: REMOTE_FALLBACK_URL }}
        style={s.bgImage}
        resizeMode="cover"
      />

      {/* Neutral Dark Scrim Layers (Black/Charcoal, Zero Blue Tint) */}
      <View style={s.scrimTop} />
      <View style={s.scrimBottom} />

      {/* Foreground Content */}
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.container}>
          {/* Top spacer (top bar removed per user request) */}
          <View style={s.topSpacer} />

          {/* Bottom Content Card */}
          <View style={s.bottomContent}>
            {/* SportLK Brand Badge with Official Logo */}
            <View style={s.brandBadge}>
              <View style={s.brandMark}>
                <Image
                  source={LOGO_IMAGE}
                  style={s.brandLogoImg}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={s.brandTitle}>
                  Sport<Text style={s.brandGold}>LK</Text>
                </Text>
                <Text style={s.brandTag}>PERFORMANCE · UNITY · EXCELLENCE</Text>
              </View>
            </View>

            {/* Main Headline */}
            <Text style={s.headline}>
              Your Game.{'\n'}Your Team.{'\n'}
              <Text style={s.headlineHighlight}>Your Arena.</Text>
            </Text>

            {/* Clear App Description */}
            <Text style={s.description}>
              Discover tournaments, reserve top sports venues, build your squad,
              and follow live match scores in real time across Sri Lanka.
            </Text>

            {/* Fixed & Clean Feature Badges (Tournaments, Venues, Live Scores) */}
            <View style={s.featuresRow}>
              <View style={s.featureChip}>
                <Text style={s.featureIcon}>🏆</Text>
                <Text style={s.featureLabel}>Tournaments</Text>
              </View>

              <View style={s.featureChip}>
                <Text style={s.featureIcon}>🏟️</Text>
                <Text style={s.featureLabel}>Venues</Text>
              </View>

              <View style={s.featureChip}>
                <Text style={s.featureIcon}>⚡</Text>
                <Text style={s.featureLabel}>Live Scores</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={s.actionsWrapper}>
              <Pressable
                onPress={onGetStarted}
                style={({ pressed }) => [
                  s.getStartedBtn,
                  pressed && s.getStartedBtnPressed,
                ]}
              >
                <Text style={s.getStartedText}>Get Started →</Text>
              </Pressable>

              <Pressable
                onPress={onSignIn}
                style={({ pressed }) => [s.secondaryBtn, pressed && s.btnPressed]}
                hitSlop={10}
              >
                <Text style={s.secondaryText}>
                  Already have an account?{' '}
                  <Text style={s.secondaryTextBold}>Sign In</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? { objectFit: 'cover' as any } : {}),
  },
  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  scrimBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    zIndex: 10,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    paddingHorizontal: 22,
    justifyContent: 'space-between',
  },
  topSpacer: {
    flex: 1,
  },
  bottomContent: {
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderWidth: 1.5,
    borderColor: '#D4B568',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  brandLogoImg: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandGold: {
    color: '#D4B568',
  },
  brandTag: {
    color: '#D1D5DB',
    fontSize: 8,
    letterSpacing: 1.6,
    marginTop: 2,
    fontWeight: '800',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH < 380 ? 30 : 36,
    fontWeight: '900',
    lineHeight: SCREEN_WIDTH < 380 ? 36 : 42,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  headlineHighlight: {
    color: '#10B981',
  },
  description: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    marginBottom: 18,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  featureChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  featureIcon: {
    fontSize: 14,
  },
  featureLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionsWrapper: {
    gap: 12,
  },
  getStartedBtn: {
    backgroundColor: '#059669',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  getStartedBtnPressed: {
    backgroundColor: '#047857',
    transform: [{ scale: 0.99 }],
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  secondaryText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  secondaryTextBold: {
    color: '#FFFFFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  btnPressed: {
    opacity: 0.75,
  },
});
