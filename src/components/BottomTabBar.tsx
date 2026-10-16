import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../theme';
import { Icon } from './Icons';
import { useTeamContext } from '../context/TeamContext';

export type TabKey = 'MyTeam' | 'Squad' | 'Challenges' | 'Teams';

interface BottomTabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

interface TabItem {
  key: TabKey;
  label: string;
  iconName: string;
}

const TABS: TabItem[] = [
  { key: 'MyTeam', label: 'My Team', iconName: 'team' },
  { key: 'Squad', label: 'Squad & Roster', iconName: 'users' },
  { key: 'Challenges', label: 'Challenges', iconName: 'challenge' },
  { key: 'Teams', label: 'Manage Teams', iconName: 'grid' },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentTab, onSelectTab }) => {
  const { joinRequests, challenges } = useTeamContext();

  const pendingRequestsCount = joinRequests.length;
  const pendingChallengesCount = challenges.filter(
    (c) => c.direction === 'received' && c.status === 'Pending'
  ).length;

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = currentTab === tab.key;
        const color = isActive ? COLORS.black : COLORS.gray400;

        // Show badge count if there are pending actions
        let badgeCount = 0;
        if (tab.key === 'Squad') badgeCount = pendingRequestsCount;
        if (tab.key === 'Challenges') badgeCount = pendingChallengesCount;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Icon name={tab.iconName} size={22} color={color} />
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
              )}
              {isActive && <View style={styles.activeDot} />}
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? COLORS.black : COLORS.gray400, fontWeight: isActive ? '700' : '500' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 76 : 64,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 6,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.black,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
});
