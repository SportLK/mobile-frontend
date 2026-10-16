import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../theme';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = COLORS.gray700, style }) => {
  switch (name) {
    case 'logo-bolt':
      return (
        <View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size * 0.28,
              backgroundColor: COLORS.primary,
              justifyContent: 'center',
              alignItems: 'center',
            },
            style,
          ]}
        >
          <Text style={{ fontSize: size * 0.65, fontWeight: '900', color: COLORS.primaryText, marginTop: -2 }}>
            ⚡
          </Text>
        </View>
      );

    case 'grid':
    case 'workspace':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <View style={{ flexDirection: 'row', gap: 2.5 }}>
            <View style={{ width: size * 0.35, height: size * 0.35, borderRadius: 2, borderWidth: 1.6, borderColor: color }} />
            <View style={{ width: size * 0.35, height: size * 0.35, borderRadius: 2, borderWidth: 1.6, borderColor: color }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 2.5, marginTop: 2.5 }}>
            <View style={{ width: size * 0.35, height: size * 0.35, borderRadius: 2, borderWidth: 1.6, borderColor: color }} />
            <View style={{ width: size * 0.35, height: size * 0.35, borderRadius: 2, borderWidth: 1.6, borderColor: color }} />
          </View>
        </View>
      );

    case 'bell':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>🔔</Text>
        </View>
      );

    case 'home':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>🏠</Text>
        </View>
      );

    case 'team':
    case 'users':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>👥</Text>
        </View>
      );

    case 'trophy':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>🏆</Text>
        </View>
      );

    case 'bolt':
    case 'challenge':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>⚡</Text>
        </View>
      );

    case 'settings':
    case 'user':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>⚙️</Text>
        </View>
      );

    case 'search':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>🔍</Text>
        </View>
      );

    case 'calendar':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>📅</Text>
        </View>
      );

    case 'location':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>📍</Text>
        </View>
      );

    case 'check':
      return (
        <View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: COLORS.activeBadgeBg,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: COLORS.activeBadgeBorder,
            },
            style,
          ]}
        >
          <Text style={{ fontSize: size * 0.55, fontWeight: '900', color: COLORS.activeBadgeText }}>✓</Text>
        </View>
      );

    case 'chevron-right':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.75, fontWeight: '600', color: color || COLORS.gray400 }}>›</Text>
        </View>
      );

    case 'chevron-left':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, fontWeight: '700', color: color || COLORS.black }}>‹</Text>
        </View>
      );

    case 'shield':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.85, color }}>🛡️</Text>
        </View>
      );

    case 'plus':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.9, fontWeight: '700', color }}>+</Text>
        </View>
      );

    default:
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Text style={{ fontSize: size * 0.8, color }}>•</Text>
        </View>
      );
  }
};
