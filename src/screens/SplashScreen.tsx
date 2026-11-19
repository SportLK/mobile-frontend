import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const LOGO_IMAGE = require('../../assets/logo.jpeg');

interface SplashScreenProps {
  onFinish: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [statusMessage, setStatusMessage] = useState('Initializing SportLK…');

  // Animation values
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.92)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const containerFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Fade & gentle scale in logo
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Animate the loading bar progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // Update status messages along the timeline
    const t1 = setTimeout(() => {
      setStatusMessage('Connecting sports arenas & fixtures…');
    }, 700);

    const t2 = setTimeout(() => {
      setStatusMessage('Synchronizing real-time leagues…');
    }, 1300);

    const t3 = setTimeout(() => {
      setStatusMessage('Ready!');
    }, 1750);

    // 3. Smooth transition to next screen
    const finishTimer = setTimeout(() => {
      Animated.timing(containerFadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(finishTimer);
    };
  }, [containerFadeAnim, logoFadeAnim, logoScaleAnim, onFinish, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[s.container, { opacity: containerFadeAnim }]}>
      <StatusBar style="dark" />

      {/* Centered Brand & Logo */}
      <Animated.View
        style={[
          s.content,
          {
            opacity: logoFadeAnim,
            transform: [{ scale: logoScaleAnim }],
          },
        ]}
      >
        {/* Real SportLK Brand Logo */}
        <View style={s.logoCard}>
          <Image
            source={LOGO_IMAGE}
            style={s.logoImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* Bottom Loading Bar Section */}
      <View style={s.loaderWrapper}>
        <View style={s.track}>
          <Animated.View style={[s.bar, { width: progressWidth }]} />
        </View>
        <Text style={s.statusText}>{statusMessage}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: Math.min(270, SCREEN_WIDTH * 0.72),
    height: Math.min(270, SCREEN_WIDTH * 0.72),
  },
  loaderWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 64 : 48,
    alignItems: 'center',
    width: '100%',
  },
  track: {
    width: Math.min(220, SCREEN_WIDTH * 0.58),
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  statusText: {
    marginTop: 12,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
