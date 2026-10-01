import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTeamContext } from '../context/TeamContext';

interface ProfileScreenProps {
  onNavigateToTeams: () => void;
  onNavigateToCreateTeam: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToTeams,
  onNavigateToCreateTeam,
}) => {
  const { user, myTeams } = useTeamContext();

  const handleApplyRole = (role: string) => {
    Alert.alert(
      'Role Application',
      `Your application for ${role} has been submitted for Admin approval!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userHandle}>@kumara_cricket • {user.district}</Text>

        <View style={styles.sportTags}>
          <View style={styles.tag}><Text style={styles.tagText}>🏏 Cricket</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>⚽ Football</Text></View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>12</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{myTeams.length}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>847</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>#142</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>
      </View>

      {/* Become More in SportLK Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Become More in SportLK</Text>

        {/* Event Organizer Application Card */}
        <View style={styles.roleCard}>
          <View style={styles.roleCardHeader}>
            <Text style={styles.roleTitle}>Event Organizer</Text>
            <View style={styles.notAppliedBadge}><Text style={styles.notAppliedText}>Not Applied</Text></View>
          </View>
          <Text style={styles.roleDesc}>Create and manage sports events across Sri Lanka.</Text>
          <TouchableOpacity style={styles.applyBtn} onPress={() => handleApplyRole('Event Organizer')}>
            <Text style={styles.applyBtnText}>Apply Now →</Text>
          </TouchableOpacity>
        </View>

        {/* Team Manager Application Card */}
        <View style={styles.roleCard}>
          <View style={styles.roleCardHeader}>
            <Text style={styles.roleTitle}>Team Manager</Text>
            <View style={styles.approvedBadge}><Text style={styles.approvedText}>Approved ✓</Text></View>
          </View>
          <Text style={styles.roleDesc}>Officially manage teams, rosters, and match registrations.</Text>
          <TouchableOpacity style={styles.applyBtnSecondary} onPress={onNavigateToCreateTeam}>
            <Text style={styles.applyBtnSecondaryText}>+ Create Team</Text>
          </TouchableOpacity>
        </View>

        {/* Switch Workspace Panel */}
        <TouchableOpacity style={styles.workspaceCard} onPress={onNavigateToTeams}>
          <View style={styles.workspaceLeft}>
            <Text style={{ fontSize: 20 }}>🔄</Text>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.workspaceTitle}>Switch Workspace</Text>
              <Text style={styles.workspaceSub}>Currently: Player Workspace</Text>
            </View>
          </View>
          <Text style={styles.workspaceArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Options List */}
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={onNavigateToTeams}>
          <Text style={styles.menuIcon}>👥</Text>
          <Text style={styles.menuText}>My Teams ({myTeams.length})</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>My Registrations</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Player Statistics</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Settings</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  profileHeader: {
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#064E3B',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userHandle: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 2,
  },
  sportTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 14,
    width: '90%',
    justifyContent: 'space-around',
    elevation: 3,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E40AF',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  notAppliedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  notAppliedText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  approvedText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '700',
  },
  roleDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  applyBtn: {
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  applyBtnSecondary: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  applyBtnSecondaryText: {
    color: '#1E40AF',
    fontWeight: '700',
    fontSize: 13,
  },
  workspaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  workspaceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workspaceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  workspaceSub: {
    fontSize: 11,
    color: '#64748B',
  },
  workspaceArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  menuList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 18,
    color: '#CBD5E1',
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
});
