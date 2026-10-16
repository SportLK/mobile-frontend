import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { Icon } from './Icons';
import { useTeamContext } from '../context/TeamContext';

interface HeaderProps {
  onPressManageTeams?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPressManageTeams }) => {
  const { activeTeam } = useTeamContext();

  return (
    <View style={styles.container}>
      {/* Brand Logo & Active Team Tag */}
      <View style={styles.leftCol}>
        <View style={styles.logoRow}>
          <Icon name="logo-bolt" size={26} />
          <Text style={styles.logoText}>SportLK</Text>
        </View>
        <View style={styles.moduleBadge}>
          <Text style={styles.moduleBadgeText}>Team & Squad</Text>
        </View>
      </View>

      {/* Right Action: Current Active Team Pill Button */}
      <TouchableOpacity
        style={styles.teamSelectorBtn}
        onPress={onPressManageTeams}
        activeOpacity={0.7}
      >
        <View style={styles.avatarMini}>
          <Text style={styles.avatarMiniText}>{activeTeam.initials}</Text>
        </View>
        <Text style={styles.teamSelectorText} numberOfLines={1}>
          {activeTeam.name}
        </Text>
        <Text style={styles.chevronMini}>▾</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: -0.4,
  },
  moduleBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  moduleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  teamSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
    maxWidth: 160,
  },
  avatarMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primaryText,
  },
  teamSelectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
    flexShrink: 1,
  },
  chevronMini: {
    fontSize: 12,
    color: COLORS.gray500,
  },
});
