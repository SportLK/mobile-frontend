import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTeamContext } from '../../context/TeamContext';
import { TeamMember, SportType } from '../../types';

interface TeamDetailScreenProps {
  teamId: string;
  onBack: () => void;
}

export const TeamDetailScreen: React.FC<TeamDetailScreenProps> = ({
  teamId,
  onBack,
}) => {
  const {
    teams,
    getTeamById,
    getTeamMembers,
    user,
    removeMember,
    changeMemberRole,
    sendInvitation,
    respondToJoinRequest,
    joinRequests,
    challenges,
    issueChallenge,
    respondToChallenge,
    requestToJoinTeam,
    updateTeam,
    myTeams,
  } = useTeamContext();

  const team = getTeamById(teamId);
  const members = getTeamMembers(teamId);

  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'requests' | 'challenges'>('overview');

  // Modal States
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeRole, setInviteeRole] = useState('Batsman');

  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [challengeDate, setChallengeDate] = useState('Oct 20, 2026 at 4:00 PM');
  const [challengeVenue, setChallengeVenue] = useState('SSC Grounds, Colombo');
  const [challengeMsg, setChallengeMsg] = useState('Are you ready for a friendly weekend match?');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editMaxPlayers, setEditMaxPlayers] = useState('20');

  if (!team) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Team not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={{ color: '#1E40AF', textAlign: 'center', marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCaptain = team.captainId === user.id;
  const isMember = members.some(m => m.userId === user.id);
  const teamJoinRequests = joinRequests.filter(r => r.teamId === teamId && r.status === 'pending');
  const teamChallenges = challenges.filter(c => c.defenderTeamId === teamId || c.challengerTeamId === teamId);

  const handleRemoveMember = (member: TeamMember) => {
    Alert.alert(
      'Remove Member',
      `Remove ${member.name} from the squad?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMember(teamId, member.id),
        },
      ]
    );
  };

  const handleChangeRole = (member: TeamMember) => {
    Alert.alert(
      'Change Role',
      `Select new role for ${member.name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Captain', onPress: () => changeMemberRole(teamId, member.id, 'Captain') },
        { text: 'Vice-Captain', onPress: () => changeMemberRole(teamId, member.id, 'Vice-Captain') },
        { text: 'Player', onPress: () => changeMemberRole(teamId, member.id, 'Player') },
      ]
    );
  };

  const handleSendInvite = () => {
    if (!inviteeName.trim()) {
      Alert.alert('Validation Error', 'Please enter player name or email.');
      return;
    }
    sendInvitation(teamId, inviteeName.trim(), inviteeRole);
    setInviteModalVisible(false);
    setInviteeName('');
    Alert.alert('Invitation Sent', `Invitation sent to ${inviteeName}!`);
  };

  const handleIssueChallengeSubmit = () => {
    issueChallenge(teamId, team.sport, challengeDate, challengeVenue, challengeMsg);
    setChallengeModalVisible(false);
    Alert.alert('Challenge Issued! ⚡', `Challenge sent to ${team.name}!`);
  };

  const handleOpenEditModal = () => {
    setEditName(team.name);
    setEditDistrict(team.district);
    setEditDesc(team.description);
    setEditContact(team.contactInfo);
    setEditMaxPlayers(String(team.maxPlayers));
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Team name cannot be empty.');
      return;
    }
    updateTeam(teamId, {
      name: editName.trim(),
      district: editDistrict.trim(),
      description: editDesc.trim(),
      contactInfo: editContact.trim(),
      maxPlayers: Number(editMaxPlayers) || team.maxPlayers,
    });
    setEditModalVisible(false);
    Alert.alert('Success 🎉', 'Team details updated successfully!');
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{team.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Team Banner / Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.logoBox}>
              <Text style={{ fontSize: 32 }}>{team.logo}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.heroName}>{team.name}</Text>
              <Text style={styles.heroSub}>
                📍 {team.district} • {team.sport}
              </Text>
              <Text style={styles.heroCaptain}>Manager: {team.captainName}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{members.length}</Text>
              <Text style={styles.statLbl}>Members</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{team.winCount}</Text>
              <Text style={styles.statLbl}>Wins</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{team.slotsAvailable}</Text>
              <Text style={styles.statLbl}>Slots Open</Text>
            </View>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.subTabsContainer}>
          <TouchableOpacity
            style={[styles.subTab, activeTab === 'overview' && styles.subTabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.subTabText, activeTab === 'overview' && styles.subTabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeTab === 'roster' && styles.subTabActive]}
            onPress={() => setActiveTab('roster')}
          >
            <Text style={[styles.subTabText, activeTab === 'roster' && styles.subTabTextActive]}>
              Roster ({members.length})
            </Text>
          </TouchableOpacity>

          {isCaptain && (
            <TouchableOpacity
              style={[styles.subTab, activeTab === 'requests' && styles.subTabActive]}
              onPress={() => setActiveTab('requests')}
            >
              <Text style={[styles.subTabText, activeTab === 'requests' && styles.subTabTextActive]}>
                Requests {teamJoinRequests.length > 0 ? `(${teamJoinRequests.length})` : ''}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.subTab, activeTab === 'challenges' && styles.subTabActive]}
            onPress={() => setActiveTab('challenges')}
          >
            <Text style={[styles.subTabText, activeTab === 'challenges' && styles.subTabTextActive]}>
              Challenges ({teamChallenges.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About Team</Text>
            <Text style={styles.descriptionText}>{team.description}</Text>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Contact Details</Text>
            <Text style={styles.infoText}>📞 {team.contactInfo}</Text>

            {isCaptain && (
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={handleOpenEditModal}
              >
                <Text style={styles.primaryActionText}>✏️ Edit Team Details</Text>
              </TouchableOpacity>
            )}

            {!isMember && (
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => {
                  requestToJoinTeam(team.id, 'Player', 'I want to join your team!');
                  Alert.alert('Request Sent', 'Join request submitted to team manager.');
                }}
              >
                <Text style={styles.primaryActionText}>Request to Join Squad</Text>
              </TouchableOpacity>
            )}

            {!isCaptain && myTeams.length > 0 && (
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => setChallengeModalVisible(true)}
              >
                <Text style={styles.secondaryActionText}>⚡ Issue Team Challenge</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ROSTER TAB */}
        {activeTab === 'roster' && (
          <View style={styles.sectionContainer}>
            {isCaptain && (
              <TouchableOpacity
                style={styles.addPlayerButton}
                onPress={() => setInviteModalVisible(true)}
              >
                <Text style={styles.addPlayerText}>+ Invite Player to Squad</Text>
              </TouchableOpacity>
            )}

            {members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={{ fontSize: 18, color: '#1E40AF', fontWeight: '700' }}>
                    {member.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRolePos}>
                    {member.position} • Joined {member.joinedDate}
                  </Text>
                </View>
                <View style={[
                  styles.rolePill,
                  member.role === 'Captain' ? styles.rolePillCaptain : styles.rolePillPlayer
                ]}>
                  <Text style={styles.rolePillText}>{member.role}</Text>
                </View>

                {isCaptain && member.userId !== user.id && (
                  <View style={styles.memberOptions}>
                    <TouchableOpacity onPress={() => handleChangeRole(member)} style={{ marginRight: 8 }}>
                      <Text style={{ fontSize: 16 }}>⚙️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveMember(member)}>
                      <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* REQUESTS TAB (Join Requests) */}
        {activeTab === 'requests' && isCaptain && (
          <View style={styles.sectionContainer}>
            {teamJoinRequests.length > 0 ? (
              teamJoinRequests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <Text style={styles.reqUserName}>{req.userName}</Text>
                  <Text style={styles.reqPos}>Position: {req.position}</Text>
                  {req.message ? <Text style={styles.reqMsg}>"{req.message}"</Text> : null}
                  <Text style={styles.reqTime}>{req.createdAt}</Text>

                  <View style={styles.reqBtnRow}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => respondToJoinRequest(req.id, true)}
                    >
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => respondToJoinRequest(req.id, false)}
                    >
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No pending join requests.</Text>
            )}
          </View>
        )}

        {/* CHALLENGES TAB */}
        {activeTab === 'challenges' && (
          <View style={styles.sectionContainer}>
            {isCaptain && (
              <TouchableOpacity
                style={styles.addPlayerButton}
                onPress={() => setChallengeModalVisible(true)}
              >
                <Text style={styles.addPlayerText}>⚡ Issue New Challenge</Text>
              </TouchableOpacity>
            )}

            {teamChallenges.length > 0 ? (
              teamChallenges.map((ch) => {
                const isIncoming = ch.defenderTeamId === teamId;
                const statusColor = ch.status === 'accepted' ? '#16A34A' : ch.status === 'declined' ? '#DC2626' : '#D97706';

                return (
                  <View key={ch.id} style={styles.challengeCard}>
                    <View style={styles.challengeHeader}>
                      <Text style={styles.challengeTitle}>
                        {ch.challengerTeamName} vs {ch.defenderTeamName}
                      </Text>
                      <View style={[styles.statusTag, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusTagText, { color: statusColor }]}>
                          {ch.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.challengeMeta}>📅 {ch.date}</Text>
                    <Text style={styles.challengeMeta}>📍 {ch.venue}</Text>
                    <Text style={styles.challengeMsg}>"{ch.message}"</Text>

                    {isIncoming && ch.status === 'pending' && isCaptain && (
                      <View style={styles.reqBtnRow}>
                        <TouchableOpacity
                          style={styles.approveBtn}
                          onPress={() => respondToChallenge(ch.id, true)}
                        >
                          <Text style={styles.approveBtnText}>Accept Challenge</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => respondToChallenge(ch.id, false)}
                        >
                          <Text style={styles.rejectBtnText}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No team challenges scheduled.</Text>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* INVITE PLAYER MODAL */}
      <Modal visible={inviteModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Player to Squad</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Player Name or Email..."
              value={inviteeName}
              onChangeText={setInviteeName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Position (e.g. Batsman, Bowler, Forward)..."
              value={inviteeRole}
              onChangeText={setInviteeRole}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setInviteModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSendInvite}>
                <Text style={styles.modalSubmitText}>Send Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ISSUE CHALLENGE MODAL */}
      <Modal visible={challengeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Issue Challenge to {team.name}</Text>
            <Text style={styles.modalLabel}>Proposed Date & Time</Text>
            <TextInput
              style={styles.modalInput}
              value={challengeDate}
              onChangeText={setChallengeDate}
            />
            <Text style={styles.modalLabel}>Venue Location</Text>
            <TextInput
              style={styles.modalInput}
              value={challengeVenue}
              onChangeText={setChallengeVenue}
            />
            <Text style={styles.modalLabel}>Challenge Message</Text>
            <TextInput
              style={styles.modalInput}
              value={challengeMsg}
              onChangeText={setChallengeMsg}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setChallengeModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleIssueChallengeSubmit}>
                <Text style={styles.modalSubmitText}>Send Challenge ⚡</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT TEAM DETAILS MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Team Details</Text>
            <Text style={styles.modalLabel}>Team Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
            />
            <Text style={styles.modalLabel}>District / City</Text>
            <TextInput
              style={styles.modalInput}
              value={editDistrict}
              onChangeText={setEditDistrict}
            />
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={styles.modalInput}
              value={editDesc}
              onChangeText={setEditDesc}
              multiline
            />
            <Text style={styles.modalLabel}>Contact Info</Text>
            <TextInput
              style={styles.modalInput}
              value={editContact}
              onChangeText={setEditContact}
            />
            <Text style={styles.modalLabel}>Max Players</Text>
            <TextInput
              style={styles.modalInput}
              value={editMaxPlayers}
              onChangeText={setEditMaxPlayers}
              keyboardType="number-pad"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveEdit}>
                <Text style={styles.modalSubmitText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  heroMeta: {
    flex: 1,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  heroCaptain: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E40AF',
  },
  statLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabActive: {
    backgroundColor: '#1E40AF',
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#334155',
  },
  primaryActionButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryActionButton: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryActionText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 14,
  },
  addPlayerButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  addPlayerText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 13,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  memberRolePos: {
    fontSize: 11,
    color: '#64748B',
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  rolePillCaptain: {
    backgroundColor: '#FEF3C7',
  },
  rolePillPlayer: {
    backgroundColor: '#F1F5F9',
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  memberOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reqUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  reqPos: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  reqMsg: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#475569',
    marginTop: 4,
  },
  reqTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  reqBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#1E40AF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 12,
  },
  challengeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  challengeMeta: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 2,
  },
  challengeMsg: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748B',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    paddingVertical: 20,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 6,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: '#1E40AF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
