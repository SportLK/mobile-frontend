import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTeamContext } from '../context/TeamContext';

interface BottomNavBarProps {
  currentTab: 'home' | 'explore' | 'teams' | 'community' | 'profile';
  onSelectTab: (tab: 'home' | 'explore' | 'teams' | 'community' | 'profile') => void;
}

interface TabItem {
  id: 'home' | 'explore' | 'teams' | 'community' | 'profile';
  label: string;
  icon: string;
  badge?: number | null;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { invitations } = useTeamContext();
  const pendingCount = invitations.filter(i => i.status === 'pending').length;

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'explore', label: 'Explore', icon: '🔍' },
    { id: 'teams', label: 'Teams', icon: '👥', badge: pendingCount > 0 ? pendingCount : null },
    { id: 'community', label: 'Community', icon: '💬' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={[styles.iconText, isActive && styles.iconActive]}>
                {tab.icon}
              </Text>
              {tab.badge ? (
                <View style={styles.badgeBox}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
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
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  iconText: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  badgeBox: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  labelActive: {
    color: '#1E40AF',
    fontWeight: '700',
  },
});
