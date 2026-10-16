import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { useTeamContext } from '../context/TeamContext';
import { EditTeamModal, CreateTeamModal } from '../components/Modals';
import { Icon } from '../components/Icons';

interface MyTeamScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const MyTeamScreen: React.FC<MyTeamScreenProps> = ({ onNavigate }) => {
  const { activeTeam, squad, joinRequests, challenges } = useTeamContext();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const pendingRequestsCount = joinRequests.length;
  const pendingChallengesCount = challenges.filter(
    (c) => c.direction === 'received' && c.status === 'Pending'
  ).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Team Header Profile */}
      <View style={styles.profileSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{activeTeam.initials}</Text>
        </View>

        <Text style={styles.teamName}>{activeTeam.name}</Text>
        <Text style={styles.teamSub}>
          {activeTeam.sport} · {activeTeam.location} · {activeTeam.level}
        </Text>

        <View style={styles.activePill}>
          <Text style={styles.activePillText}>{activeTeam.status}</Text>
        </View>
      </View>

      {/* 3 Stats Counters */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{squad.length}</Text>
          <Text style={styles.statDesc}>Players</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statVal}>{activeTeam.matchesCount}</Text>
          <Text style={styles.statDesc}>Matches</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statVal}>{activeTeam.winsCount}</Text>
          <Text style={styles.statDesc}>Wins</Text>
        </View>
      </View>

      {/* Team Bio */}
      <Text style={styles.bioText}>{activeTeam.bio}</Text>

      {/* Actions (Manage squad / Edit team) */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.manageSquadBtn}
          onPress={() => onNavigate('Squad')}
          activeOpacity={0.8}
        >
          <Text style={styles.manageSquadBtnText}>Manage squad</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editTeamBtn}
          onPress={() => setEditModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.editTeamBtnText}>Edit team</Text>
        </TouchableOpacity>
      </View>

      {/* Team Management Alerts / Quick Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Squad Activity</Text>
        <View style={styles.activityCard}>
          {/* Join Requests summary */}
          <TouchableOpacity
            style={styles.activityRow}
            onPress={() => onNavigate('Squad', { tab: 'requests' })}
            activeOpacity={0.7}
          >
            <View style={styles.activityIconCircle}>
              <Icon name="team" size={18} color={COLORS.gray700} />
            </View>
            <View style={styles.activityTextWrap}>
              <Text style={styles.activityTitle}>Join Requests</Text>
              <Text style={styles.activitySub}>
                {pendingRequestsCount > 0
                  ? `${pendingRequestsCount} player applications awaiting review`
                  : 'No pending join requests'}
              </Text>
            </View>
            {pendingRequestsCount > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingRequestsCount}</Text>
              </View>
            )}
            <Icon name="chevron-right" size={16} color={COLORS.gray400} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Incoming Challenges summary */}
          <TouchableOpacity
            style={styles.activityRow}
            onPress={() => onNavigate('Challenges')}
            activeOpacity={0.7}
          >
            <View style={styles.activityIconCircle}>
              <Icon name="challenge" size={18} color={COLORS.gray700} />
            </View>
            <View style={styles.activityTextWrap}>
              <Text style={styles.activityTitle}>Incoming Challenges</Text>
              <Text style={styles.activitySub}>
                {pendingChallengesCount > 0
                  ? `${pendingChallengesCount} opponent challenges awaiting response`
                  : 'All challenges answered'}
              </Text>
            </View>
            {pendingChallengesCount > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingChallengesCount}</Text>
              </View>
            )}
            <Icon name="chevron-right" size={16} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Squad Roster Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Squad Roster</Text>
          <TouchableOpacity onPress={() => onNavigate('Squad')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.viewAllLink}>View all ({squad.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.squadListCard}>
          {squad.slice(0, 5).map((member, index) => (
            <View key={member.id}>
              <View style={styles.squadItem}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.initials}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>
                    {member.role} {member.jerseyNumber ? `· #${member.jerseyNumber}` : ''}
                  </Text>
                </View>
                <View style={styles.memberStatusPill}>
                  <Text style={styles.memberStatusText}>{member.status}</Text>
                </View>
              </View>
              {index < Math.min(squad.length, 5) - 1 && <View style={styles.squadDivider} />}
            </View>
          ))}
        </View>
      </View>

      {/* Switch / Create another team CTA */}
      <TouchableOpacity
        style={styles.createTeamBtn}
        onPress={() => onNavigate('Teams')}
        activeOpacity={0.8}
      >
        <Text style={styles.createTeamBtnText}>Switch / Create Another Team</Text>
      </TouchableOpacity>

      <EditTeamModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} />
      <CreateTeamModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} />
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
  profileSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#334155',
  },
  teamName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: -0.4,
  },
  teamSub: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 3,
  },
  activePill: {
    backgroundColor: COLORS.activeBadgeBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.activeBadgeText,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginVertical: 16,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
  },
  statDesc: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.gray200,
  },
  bioText: {
    fontSize: 13,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  manageSquadBtn: {
    flex: 1,
    backgroundColor: COLORS.black,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  manageSquadBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  editTeamBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  editTeamBtnText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.2,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.black,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  activitySub: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: COLORS.pendingBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.pendingBadgeText,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginLeft: 60,
  },
  squadListCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: 16,
  },
  squadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  memberRole: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 1,
  },
  memberStatusPill: {
    backgroundColor: COLORS.activeBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  memberStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.activeBadgeText,
  },
  squadDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
  },
  createTeamBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  createTeamBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
});
