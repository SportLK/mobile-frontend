import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  color: string;
  size?: number;
}

/**
 * 1. Home Icon (Clean pitched roof, walls, and doorway)
 * Matches the Figma design: ⌂ House outline
 */
export function HomeIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={[s.iconBox, { width: size, height: size }]}>
      {/* Roof peak: 45° rotated square showing top & left borders */}
      <View
        style={[
          s.homeRoof,
          {
            width: size * 0.54,
            height: size * 0.54,
            borderColor: color,
            top: size * 0.1,
          },
        ]}
      />
      {/* Main walls & base */}
      <View
        style={[
          s.homeBody,
          {
            width: size * 0.62,
            height: size * 0.44,
            borderColor: color,
            bottom: size * 0.12,
          },
        ]}
      >
        {/* Door cutout in bottom center */}
        <View
          style={[
            s.homeDoor,
            {
              width: size * 0.22,
              height: size * 0.24,
              borderColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

/**
 * 2. Community Icon (Speech/chat bubble with bottom-left pointer tail)
 * Matches the Figma design: 💬 Speech bubble outline
 */
export function CommunityIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={[s.iconBox, { width: size, height: size }]}>
      {/* Main rounded rectangular speech bubble */}
      <View
        style={[
          s.bubbleBody,
          {
            width: size * 0.76,
            height: size * 0.60,
            borderColor: color,
            top: size * 0.14,
          },
        ]}
      />
      {/* Speech bubble pointer tail at bottom-left */}
      <View
        style={[
          s.bubbleTail,
          {
            width: size * 0.22,
            height: size * 0.22,
            borderColor: color,
            bottom: size * 0.14,
            left: size * 0.14,
          },
        ]}
      />
    </View>
  );
}

/**
 * 3. Tournaments Icon (Trophy cup with dual handles and sturdy base)
 * Matches the Figma design: 🏆 Trophy cup outline
 */
export function TournamentsIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={[s.iconBox, { width: size, height: size }]}>
      {/* Dual side handles loop */}
      <View
        style={[
          s.trophyHandles,
          {
            width: size * 0.80,
            height: size * 0.38,
            borderColor: color,
            top: size * 0.14,
          },
        ]}
      />
      {/* Main trophy cup body (U-shaped) */}
      <View
        style={[
          s.trophyCup,
          {
            width: size * 0.52,
            height: size * 0.42,
            borderBottomLeftRadius: size * 0.26,
            borderBottomRightRadius: size * 0.26,
            borderColor: color,
            top: size * 0.12,
          },
        ]}
      />
      {/* Stem */}
      <View
        style={[
          s.trophyStem,
          {
            backgroundColor: color,
            bottom: size * 0.18,
            height: size * 0.16,
          },
        ]}
      />
      {/* Pedestal / Base */}
      <View
        style={[
          s.trophyBase,
          {
            backgroundColor: color,
            width: size * 0.46,
            bottom: size * 0.14,
          },
        ]}
      />
    </View>
  );
}

/**
 * 4. Venues Icon (Teardrop map pin with center dot)
 * Matches the Figma design: 📍 Location pin outline
 */
export function VenuesIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={[s.iconBox, { width: size, height: size }]}>
      {/* Teardrop shape pointing down (rotated -45 degrees) */}
      <View
        style={[
          s.pinHead,
          {
            width: size * 0.56,
            height: size * 0.56,
            borderTopLeftRadius: size * 0.28,
            borderTopRightRadius: size * 0.28,
            borderBottomLeftRadius: size * 0.28,
            borderColor: color,
            top: size * 0.10,
          },
        ]}
      >
        {/* Center dot inside pin */}
        <View
          style={[
            s.pinDot,
            {
              width: size * 0.16,
              height: size * 0.16,
              borderRadius: size * 0.08,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

/**
 * 5. Profile Icon (Person head and curved shoulders outline)
 * Matches the Figma design: 👤 Person silhouette outline
 */
export function ProfileIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={[s.iconBox, { width: size, height: size }]}>
      {/* Head circle */}
      <View
        style={[
          s.profileHead,
          {
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: size * 0.18,
            borderColor: color,
            top: size * 0.12,
          },
        ]}
      />
      {/* Shoulders arch */}
      <View
        style={[
          s.profileShoulders,
          {
            width: size * 0.72,
            height: size * 0.32,
            borderTopLeftRadius: size * 0.36,
            borderTopRightRadius: size * 0.36,
            borderColor: color,
            bottom: size * 0.14,
          },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  // Home
  homeRoof: {
    position: 'absolute',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: '45deg' }],
    borderTopLeftRadius: 1.5,
  },
  homeBody: {
    position: 'absolute',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  homeDoor: {
    borderTopWidth: 1.8,
    borderLeftWidth: 1.8,
    borderRightWidth: 1.8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  // Community
  bubbleBody: {
    position: 'absolute',
    borderRadius: 3.5,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  bubbleTail: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  // Tournaments
  trophyHandles: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 1.8,
  },
  trophyCup: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  trophyStem: {
    position: 'absolute',
    width: 2.2,
  },
  trophyBase: {
    position: 'absolute',
    height: 2.2,
    borderRadius: 1,
  },
  // Venues
  pinHead: {
    position: 'absolute',
    borderBottomRightRadius: 1,
    borderWidth: 2,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    transform: [{ rotate: '45deg' }],
  },
  // Profile
  profileHead: {
    position: 'absolute',
    borderWidth: 2,
  },
  profileShoulders: {
    position: 'absolute',
    borderWidth: 2,
    borderBottomWidth: 0,
  },
});

