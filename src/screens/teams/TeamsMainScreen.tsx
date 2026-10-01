import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useTeamContext } from '../../context/TeamContext';
import { SportType, Team } from '../../types';

interface TeamsMainScreenProps {
  onNavigateToCreateTeam: () => void;
  onSelectTeam: (teamId: string) => void;
}

export const TeamsMainScreen: React.FC<TeamsMainScreenProps> = ({
  onNavigateToCreateTeam,
  onSelectTeam,
}) => {
  const {
    teams,
    myTeams,
    invitations,
    joinRequests,
    user,
    requestToJoinTeam,
    respondToInvitation,
    leaveTeam,
  } = useTeamContext();

  const [activeTab, setActiveTab] = useState<'discover' | 'my-teams' | 'invitations'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [requestModalTeamId, setRequestModalTeamId] = useState<string | null>(null);

  const sportsList = ['All', 'Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Tennis'];

  // Filter teams for Discover tab
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          team.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || team.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const pendingInvitations = invitations.filter(i => i.status === 'pending');

  const handleRequestJoin = (teamId: string) => {
    requestToJoinTeam(teamId, 'Player', 'I would love to join your squad!');
    Alert.alert('Request Sent', 'Your request to join the team has been submitted to the Team Manager.');
  };

  const handleLeaveTeam = (teamId: string, teamName: string) => {
    Alert.alert(
      'Leave Team',
      `Are you sure you want to leave ${teamName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => leaveTeam(teamId),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teams</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={onNavigateToCreateTeam}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>+ Create Team</Text>
        </TouchableOpacity>
      </View>

      {/* Main Tabs Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'discover' && styles.tabItemActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            Discover
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'my-teams' && styles.tabItemActive]}
          onPress={() => setActiveTab('my-teams')}
        >
          <Text style={[styles.tabText, activeTab === 'my-teams' && styles.tabTextActive]}>
            My Teams ({myTeams.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'invitations' && styles.tabItemActive]}
          onPress={() => setActiveTab('invitations')}
        >
          <Text style={[styles.tabText, activeTab === 'invitations' && styles.tabTextActive]}>
            Invitations {pendingInvitations.length > 0 ? `(${pendingInvitations.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* DISCOVER TAB CONTENT */}
        {activeTab === 'discover' && (
          <View>
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search teams by name or city..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={{ fontSize: 16, color: '#666' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sport Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsScroll}>
              {sportsList.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.sportChip,
                    selectedSport === sport && styles.sportChipActive,
                  ]}
                  onPress={() => setSelectedSport(sport)}
                >
                  <Text style={[
                    styles.sportChipText,
                    selectedSport === sport && styles.sportChipTextActive,
                  ]}>
                    {sport}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Team List */}
            {filteredTeams.map((team) => {
              const isMyTeam = myTeams.some(t => t.id === team.id);
              const hasRequested = joinRequests.some(r => r.teamId === team.id && r.userId === user.id && r.status === 'pending');

              return (
                <View key={team.id} style={styles.teamCard}>
                  <View style={styles.teamCardHeader}>
                    <View style={styles.logoBadge}>
                      <Text style={styles.logoEmoji}>{team.logo}</Text>
                    </View>
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{team.name}</Text>
                      <Text style={styles.teamMeta}>
                        📍 {team.district} • {team.sport}
                      </Text>
                      <Text style={styles.teamStatsText}>
                        👥 {team.currentMemberCount} members  🏆 {team.winCount} wins
                      </Text>
                    </View>
                    <View style={styles.slotsBadge}>
                      <Text style={styles.slotsBadgeText}>{team.slotsAvailable} slots</Text>
                    </View>
                  </View>

                  <View style={styles.teamCardActions}>
                    {!isMyTeam ? (
                      <TouchableOpacity
                        style={[
                          styles.actionButtonPrimary,
                          hasRequested && styles.actionButtonDisabled,
                        ]}
                        onPress={() => !hasRequested && handleRequestJoin(team.id)}
                        disabled={hasRequested}
                      >
                        <Text style={styles.actionButtonPrimaryText}>
                          {hasRequested ? 'Requested' : 'Request to Join'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.joinedBadgeContainer}>
                        <Text style={styles.joinedBadgeText}>✓ Member</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.actionButtonSecondary}
                      onPress={() => onSelectTeam(team.id)}
                    >
                      <Text style={styles.actionButtonSecondaryText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* MY TEAMS TAB CONTENT */}
        {activeTab === 'my-teams' && (
          <View>
            {myTeams.map((team) => {
              const isCaptain = team.captainId === user.id;

              return (
                <View key={team.id} style={styles.teamCard}>
                  <View style={styles.teamCardHeader}>
                    <View style={styles.logoBadge}>
                      <Text style={styles.logoEmoji}>{team.logo}</Text>
                    </View>
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{team.name}</Text>
                      <Text style={styles.teamMeta}>
                        📍 {team.district} • 👥 {team.currentMemberCount} members
                      </Text>
                    </View>
                    <View style={[styles.roleBadge, isCaptain ? styles.roleBadgeCaptain : styles.roleBadgePlayer]}>
                      <Text style={[styles.roleBadgeText, isCaptain ? styles.roleBadgeTextCaptain : styles.roleBadgeTextPlayer]}>
                        {isCaptain ? 'Manager' : 'Player'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.teamCardActions}>
                    <TouchableOpacity
                      style={styles.actionButtonPrimary}
                      onPress={() => onSelectTeam(team.id)}
                    >
                      <Text style={styles.actionButtonPrimaryText}>View Team</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButtonSecondary}
                      onPress={() => handleLeaveTeam(team.id, team.name)}
                    >
                      <Text style={styles.actionButtonSecondaryText}>Leave Team</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Prominent Dotted Box to Create New Team */}
            <TouchableOpacity
              style={styles.dottedCreateBox}
              onPress={onNavigateToCreateTeam}
              activeOpacity={0.7}
            >
              <Text style={styles.dottedPlus}>+</Text>
              <Text style={styles.dottedTitle}>Create a New Team</Text>
              <Text style={styles.dottedSubtitle}>Start your own team and invite players</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* INVITATIONS TAB CONTENT */}
        {activeTab === 'invitations' && (
          <View>
            {pendingInvitations.length > 0 ? (
              pendingInvitations.map((invite) => (
                <View key={invite.id} style={styles.inviteCard}>
                  <View style={styles.inviteHeader}>
                    <View style={styles.inviteIconBox}>
                      <Text style={{ fontSize: 24 }}>⚡</Text>
                    </View>
                    <View style={styles.inviteInfo}>
                      <Text style={styles.inviteTeamName}>{invite.teamName}</Text>
                      <Text style={styles.inviteSubtext}>
                        Invited you to join as <Text style={{ fontWeight: 'bold', color: '#1E3A8A' }}>{invite.role}</Text>
                      </Text>
                      <Text style={styles.inviteTime}>{invite.createdAt}</Text>
                    </View>
                  </View>

                  <View style={styles.inviteActions}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => respondToInvitation(invite.id, true)}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => respondToInvitation(invite.id, false)}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>📬</Text>
                <Text style={styles.emptyStateTitle}>No more pending invitations</Text>
                <Text style={styles.emptyStateSub}>
                  When team captains invite you to join their squad, invitations will appear here.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  createButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#1E40AF',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  sportsScroll: {
    marginBottom: 16,
  },
  sportChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sportChipActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  sportChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  sportChipTextActive: {
    color: '#FFFFFF',
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 22,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  teamMeta: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  teamStatsText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  slotsBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  slotsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeCaptain: {
    backgroundColor: '#FEF3C7',
  },
  roleBadgePlayer: {
    backgroundColor: '#F1F5F9',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleBadgeTextCaptain: {
    color: '#B45309',
  },
  roleBadgeTextPlayer: {
    color: '#475569',
  },
  teamCardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: '#1E40AF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  actionButtonPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  actionButtonSecondary: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  joinedBadgeContainer: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinedBadgeText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 13,
  },
  dottedCreateBox: {
    borderWidth: 2,
    borderColor: '#86EFAC',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  dottedPlus: {
    fontSize: 32,
    color: '#16A34A',
    fontWeight: '300',
    marginBottom: 4,
  },
  dottedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 4,
  },
  dottedSubtitle: {
    fontSize: 12,
    color: '#166534',
  },
  inviteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  inviteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF08A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteTeamName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  inviteSubtext: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  inviteTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#1E40AF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptyStateSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});
