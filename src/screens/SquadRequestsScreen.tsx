import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme';
import { useTeamContext } from '../context/TeamContext';
import { InvitePlayerModal } from '../components/Modals';

interface SquadRequestsScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  initialTab?: 'roster' | 'requests' | 'invitations';
}

export const SquadRequestsScreen: React.FC<SquadRequestsScreenProps> = ({
  initialTab = 'roster',
}) => {
  const {
    activeTeam,
    squad,
    joinRequests,
    invitations,
    acceptJoinRequest,
    rejectJoinRequest,
    removeSquadMember,
    cancelInvitation,
  } = useTeamContext();

  const [activeTab, setActiveTab] = useState<'roster' | 'requests' | 'invitations'>(initialTab);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const handleConfirmRemove = (id: string, name: string) => {
    Alert.alert(
      'Remove Squad Member',
      `Are you sure you want to remove ${name} from ${activeTeam.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeSquadMember(id) },
      ]
    );
  };

  const handleCancelInvite = (id: string, name: string) => {
    Alert.alert(
      'Cancel Invitation',
      `Cancel pending squad invitation for ${name}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Cancel Invite', style: 'destructive', onPress: () => cancelInvitation(id) },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Squad & Roster</Text>
        <Text style={styles.subtitle}>
          {activeTeam.name} · {squad.length} active players
        </Text>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={styles.inviteBtn}
        onPress={() => setInviteModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.inviteBtnText}>+ Invite Player to Squad</Text>
      </TouchableOpacity>

      {/* Segmented Tab Bar */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'roster' && styles.tabButtonActive]}
          onPress={() => setActiveTab('roster')}
        >
          <Text style={[styles.tabText, activeTab === 'roster' && styles.tabTextActive]}>
            Roster ({squad.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'requests' && styles.tabButtonActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Requests ({joinRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'invitations' && styles.tabButtonActive]}
          onPress={() => setActiveTab('invitations')}
        >
          <Text style={[styles.tabText, activeTab === 'invitations' && styles.tabTextActive]}>
            Invites ({invitations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- 1. ROSTER TAB ---------------- */}
      {activeTab === 'roster' && (
        <View style={styles.section}>
          <View style={styles.cardList}>
            {squad.map((member, index) => {
              const isLeadership = member.role === 'Captain' || member.role === 'Vice-Captain';

              return (
                <View key={member.id}>
                  <View style={styles.squadRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{member.initials}</Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        {member.jerseyNumber ? (
                          <View style={styles.jerseyBadge}>
                            <Text style={styles.jerseyBadgeText}>#{member.jerseyNumber}</Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.metaRow}>
                        <View style={[styles.roleBadge, isLeadership && styles.leadershipBadge]}>
                          <Text style={[styles.roleBadgeText, isLeadership && styles.leadershipBadgeText]}>
                            {member.role}
                          </Text>
                        </View>
                        <Text style={styles.joinedText}>Joined {member.joinedDate}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleConfirmRemove(member.id, member.name)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.removeLink}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  {index < squad.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* ---------------- 2. JOIN REQUESTS TAB ---------------- */}
      {activeTab === 'requests' && (
        <View style={styles.section}>
          {joinRequests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No pending join requests</Text>
              <Text style={styles.emptySub}>When players apply to join your squad, they will appear here.</Text>
            </View>
          ) : (
            <View style={styles.requestsWrapper}>
              {joinRequests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{req.initials}</Text>
                    </View>
                    <View style={styles.requestMeta}>
                      <Text style={styles.requestName}>{req.name}</Text>
                      <Text style={styles.requestSport}>{req.sportLevel}</Text>
                      <Text style={styles.requestedDate}>Requested {req.requestedDate}</Text>
                    </View>
                  </View>

                  {req.message && (
                    <View style={styles.messageBox}>
                      <Text style={styles.messageText}>"{req.message}"</Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={styles.requestActionsRow}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => acceptJoinRequest(req.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.acceptBtnText}>Accept into Squad</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => rejectJoinRequest(req.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.rejectBtnText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ---------------- 3. INVITATIONS TAB ---------------- */}
      {activeTab === 'invitations' && (
        <View style={styles.section}>
          {invitations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No pending invitations</Text>
              <Text style={styles.emptySub}>Invite players to join your squad using the button above.</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {invitations.map((inv, index) => (
                <View key={inv.id}>
                  <View style={styles.squadRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {inv.playerName.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{inv.playerName}</Text>
                      <Text style={styles.memberRole}>
                        Invited as: {inv.role} {inv.jerseyNumber ? `· #${inv.jerseyNumber}` : ''}
                      </Text>
                      <Text style={styles.joinedText}>Sent {inv.sentDate}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleCancelInvite(inv.id, inv.playerName)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.cancelLink}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                  {index < invitations.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <InvitePlayerModal visible={inviteModalVisible} onClose={() => setInviteModalVisible(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 36,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: 3,
  },
  inviteBtn: {
    backgroundColor: COLORS.black,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  inviteBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  tabTextActive: {
    color: COLORS.black,
    fontWeight: '800',
  },
  section: {
    marginBottom: 20,
  },
  cardList: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: 16,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  jerseyBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  jerseyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  roleBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  leadershipBadge: {
    backgroundColor: COLORS.activeBadgeBg,
  },
  leadershipBadgeText: {
    color: COLORS.activeBadgeText,
    fontWeight: '700',
  },
  joinedText: {
    fontSize: 11,
    color: COLORS.gray400,
  },
  memberRole: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  removeLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray400,
  },
  cancelLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
  },
  requestsWrapper: {
    gap: 14,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestMeta: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  requestSport: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 1,
  },
  requestedDate: {
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 2,
  },
  messageBox: {
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  messageText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: 'italic',
  },
  requestActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: COLORS.primaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: COLORS.gray700,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.gray400,
    textAlign: 'center',
    lineHeight: 18,
  },
});
