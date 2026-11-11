import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { teamService } from '../../services/teamService';
import {
  Team,
  TeamMember,
  TeamInvitation,
  TeamChallenge,
  SportType,
  TeamMemberRole,
} from '../../types/team.types';

interface TeamsScreenProps {
  onBack?: () => void;
}

const FALLBACK_TEAMS: Team[] = [];
const FALLBACK_INVITATIONS: TeamInvitation[] = [];
const FALLBACK_JOIN_REQUESTS: TeamInvitation[] = [];
const FALLBACK_CHALLENGES: TeamChallenge[] = [];

export default function TeamsScreen({ onBack }: TeamsScreenProps) {
  const { accessToken, userName, userEmail } = useAuth();

  // Navigation & Sub-views
  const [mainTab, setMainTab] = useState<'my_teams' | 'browse' | 'challenges'>('my_teams');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamProfileTab, setTeamProfileTab] = useState<'roster' | 'join_requests' | 'invitations' | 'challenges'>('roster');

  // Data states
  const [teams, setTeams] = useState<Team[]>(FALLBACK_TEAMS);
  const [invitations, setInvitations] = useState<TeamInvitation[]>(FALLBACK_INVITATIONS);
  const [joinRequests, setJoinRequests] = useState<TeamInvitation[]>(FALLBACK_JOIN_REQUESTS);
  const [challenges, setChallenges] = useState<TeamChallenge[]>(FALLBACK_CHALLENGES);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');

  // Modals
  const [createTeamModal, setCreateTeamModal] = useState(false);
  const [editTeamModal, setEditTeamModal] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [editMemberModal, setEditMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [challengeModal, setChallengeModal] = useState(false);

  // Form fields: Team
  const [formTeamName, setFormTeamName] = useState('');
  const [formSportType, setFormSportType] = useState<SportType>('CRICKET');
  const [formCity, setFormCity] = useState('Colombo');
  const [formBio, setFormBio] = useState('');

  // Form fields: Member & Role
  const [formMemberName, setFormMemberName] = useState('');
  const [formMemberRole, setFormMemberRole] = useState<TeamMemberRole>('SQUAD_PLAYER');
  const [formJersey, setFormJersey] = useState('');

  // Form fields: Invite & Challenge
  const [formInviteUser, setFormInviteUser] = useState('');
  const [formChallengeTargetId, setFormChallengeTargetId] = useState('');
  const [formChallengeVenue, setFormChallengeVenue] = useState('Colombo Oval');
  const [formChallengeDate, setFormChallengeDate] = useState('2026-11-25T15:00:00Z');

  // Load teams & related records
  const loadData = useCallback(async () => {
    try {
      const data = await teamService.getTeams({
        sportType: selectedSport === 'All' ? undefined : selectedSport.toUpperCase(),
        search: search.trim() || undefined,
      });
      setTeams(Array.isArray(data) ? data : []);
    } catch {
      // Kept fallback teams
    }
  }, [selectedSport, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Helper: check if logged-in user manages this team
  const isManagerOfTeam = (team: Team) => {
    return (
      team.managerId === userName ||
      team.manager?.displayName === userName ||
      team.manager?.email === userEmail
    );
  };

  // ── 1. Create Team ─────────────────────────────────────────────────────────
  const handleCreateTeam = async () => {
    if (!formTeamName.trim()) {
      Alert.alert('Required', 'Please enter a valid team name');
      return;
    }

    const newTeam: Team = {
      id: `team-local-${Date.now()}`,
      managerId: userName,
      teamName: formTeamName.trim(),
      sportType: formSportType,
      primaryLocationCity: formCity.trim() || 'Colombo',
      teamBio: formBio.trim(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      playersCount: 1,
      manager: {
        id: userName,
        displayName: userName,
        email: userEmail,
      },
      members: [
        {
          id: `m-${Date.now()}`,
          teamId: `team-local-${Date.now()}`,
          userId: userName,
          memberRole: 'CAPTAIN',
          jerseyNumber: 1,
          joinedAt: new Date().toISOString().split('T')[0],
          user: { id: userName, displayName: userName, email: userEmail },
        },
      ],
    };

    try {
      if (accessToken) {
        const created = await teamService.createTeam(
          {
            managerId: userName,
            teamName: newTeam.teamName,
            sportType: newTeam.sportType,
            primaryLocationCity: newTeam.primaryLocationCity || undefined,
            teamBio: newTeam.teamBio || undefined,
          },
          accessToken,
        );
        if (created?.id) newTeam.id = created.id;
      }
    } catch {
      // Fallback local creation
    }

    setTeams((prev) => [newTeam, ...prev]);
    setCreateTeamModal(false);
    setFormTeamName('');
    setFormBio('');
    Alert.alert('Team Created', `"${newTeam.teamName}" has been established! You are registered as Captain.`);
  };

  // ── 1b. Update Team Profile ────────────────────────────────────────────────
  const handleUpdateTeamProfile = async () => {
    if (!selectedTeam) return;

    const updated: Team = {
      ...selectedTeam,
      teamName: formTeamName.trim() || selectedTeam.teamName,
      primaryLocationCity: formCity.trim() || selectedTeam.primaryLocationCity,
      teamBio: formBio.trim() || selectedTeam.teamBio,
    };

    try {
      if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
        await teamService.updateTeam(
          selectedTeam.id,
          {
            teamName: updated.teamName,
            primaryLocationCity: updated.primaryLocationCity || undefined,
            teamBio: updated.teamBio || undefined,
          },
          accessToken,
        );
      }
    } catch {
      // Fallback
    }

    setSelectedTeam(updated);
    setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditTeamModal(false);
    Alert.alert('Profile Updated', 'Team details have been updated.');
  };

  // ── 2 & 4. Add Member to Roster ───────────────────────────────────────────
  const handleAddMember = async () => {
    if (!selectedTeam || !formMemberName.trim()) {
      Alert.alert('Required', 'Please enter player name or username');
      return;
    }

    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      teamId: selectedTeam.id,
      userId: formMemberName.trim(),
      memberRole: formMemberRole,
      jerseyNumber: formJersey ? parseInt(formJersey, 10) : undefined,
      joinedAt: new Date().toISOString().split('T')[0],
      user: {
        id: formMemberName.trim(),
        displayName: formMemberName.trim(),
        email: `${formMemberName.trim().toLowerCase().replace(/\s+/g, '')}@sportlk.com`,
      },
    };

    try {
      if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
        await teamService.addTeamMember(
          selectedTeam.id,
          {
            userId: newMember.userId,
            memberRole: newMember.memberRole,
            jerseyNumber: newMember.jerseyNumber || undefined,
          },
          accessToken,
        );
      }
    } catch {
      // Fallback
    }

    const currentMembers = selectedTeam.members || [];
    const updatedTeam = {
      ...selectedTeam,
      playersCount: (selectedTeam.playersCount || currentMembers.length) + 1,
      members: [...currentMembers, newMember],
    };

    setSelectedTeam(updatedTeam);
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
    setAddMemberModal(false);
    setFormMemberName('');
    setFormJersey('');
    Alert.alert('Player Added', `${newMember.user?.displayName} has been added to the squad roster.`);
  };

  // ── 4b. Update Member Role & Jersey ────────────────────────────────────────
  const handleUpdateMemberRole = async () => {
    if (!selectedTeam || !selectedMember) return;

    const updatedMembers = (selectedTeam.members || []).map((m) => {
      if (m.id === selectedMember.id) {
        return {
          ...m,
          memberRole: formMemberRole,
          jerseyNumber: formJersey ? parseInt(formJersey, 10) : m.jerseyNumber,
        };
      }
      return m;
    });

    try {
      if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
        await teamService.updateMemberRole(
          selectedTeam.id,
          selectedMember.id,
          {
            memberRole: formMemberRole,
            jerseyNumber: formJersey ? parseInt(formJersey, 10) : undefined,
          },
          accessToken,
        );
      }
    } catch {
      // Fallback
    }

    const updatedTeam = { ...selectedTeam, members: updatedMembers };
    setSelectedTeam(updatedTeam);
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
    setEditMemberModal(false);
    setSelectedMember(null);
    Alert.alert('Roster Updated', 'Player role and jersey number updated.');
  };

  // ── 4c. Remove Member ──────────────────────────────────────────────────────
  const handleRemoveMember = (member: TeamMember) => {
    if (!selectedTeam) return;

    Alert.alert('Remove Player', `Remove ${member.user?.displayName || 'player'} from the roster?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
              await teamService.removeTeamMember(selectedTeam.id, member.id, accessToken);
            }
          } catch {
            // Fallback
          }

          const currentMembers = selectedTeam.members || [];
          const updatedMembers = currentMembers.filter((m) => m.id !== member.id);
          const updatedTeam = {
            ...selectedTeam,
            playersCount: Math.max(1, (selectedTeam.playersCount || 1) - 1),
            members: updatedMembers,
          };

          setSelectedTeam(updatedTeam);
          setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
        },
      },
    ]);
  };

  // ── 5. Invitations (Manager -> Player) ─────────────────────────────────────
  const handleSendInvitation = async () => {
    if (!selectedTeam || !formInviteUser.trim()) {
      Alert.alert('Required', 'Please enter player username or email');
      return;
    }

    const newInvite: TeamInvitation = {
      id: `inv-${Date.now()}`,
      teamId: selectedTeam.id,
      invitedUserId: formInviteUser.trim(),
      inviteType: 'MANAGER_TO_PLAYER',
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
      invitedUser: {
        id: formInviteUser.trim(),
        displayName: formInviteUser.trim(),
        email: `${formInviteUser.trim().toLowerCase().replace(/\s+/g, '')}@sportlk.com`,
      },
    };

    try {
      if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
        await teamService.createInvitation(selectedTeam.id, newInvite.invitedUserId, accessToken);
      }
    } catch {
      // Fallback
    }

    setInvitations((prev) => [newInvite, ...prev]);
    setInviteModal(false);
    setFormInviteUser('');
    Alert.alert('Invitation Sent', `Formal invitation sent to ${newInvite.invitedUser?.displayName}.`);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!selectedTeam) return;

    try {
      if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
        await teamService.cancelInvitation(selectedTeam.id, invitationId, accessToken);
      }
    } catch {
      // Fallback
    }

    setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    Alert.alert('Cancelled', 'Player invitation cancelled.');
  };

  // ── 6. Join Requests (Player -> Team) ──────────────────────────────────────
  const handleSendJoinRequest = async (team: Team) => {
    Alert.alert('Request to Join', `Send a join request to ${team.teamName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send Request',
        onPress: async () => {
          const req: TeamInvitation = {
            id: `req-${Date.now()}`,
            teamId: team.id,
            invitedUserId: userName,
            inviteType: 'PLAYER_REQUEST_TO_JOIN',
            status: 'PENDING',
            createdAt: new Date().toISOString().split('T')[0],
            invitedUser: { id: userName, displayName: userName, email: userEmail },
          };

          try {
            if (accessToken && !team.id.startsWith('team-demo-')) {
              await teamService.createJoinRequest(team.id, userName, accessToken);
            }
          } catch {
            // Fallback
          }

          setJoinRequests((prev) => [req, ...prev]);
          Alert.alert('Request Sent', `Your request to join ${team.teamName} has been submitted to the manager.`);
        },
      },
    ]);
  };

  const handleAcceptJoinRequest = async (request: TeamInvitation) => {
    if (!selectedTeam) return;

    try {
      if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
        await teamService.acceptJoinRequest(selectedTeam.id, request.id, accessToken);
      }
    } catch {
      // Fallback
    }

    // Add player to roster
    const newMember: TeamMember = {
      id: `m-req-${Date.now()}`,
      teamId: selectedTeam.id,
      userId: request.invitedUserId,
      memberRole: 'SQUAD_PLAYER',
      jerseyNumber: (selectedTeam.members?.length || 0) + 1,
      joinedAt: new Date().toISOString().split('T')[0],
      user: request.invitedUser,
    };

    const updatedTeam = {
      ...selectedTeam,
      playersCount: (selectedTeam.playersCount || 0) + 1,
      members: [...(selectedTeam.members || []), newMember],
    };

    setSelectedTeam(updatedTeam);
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
    setJoinRequests((prev) => prev.filter((r) => r.id !== request.id));
    Alert.alert('Request Accepted', `${request.invitedUser?.displayName} is now a roster squad player!`);
  };

  const handleRejectJoinRequest = async (requestId: string) => {
    if (!selectedTeam) return;

    try {
      if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
        await teamService.rejectJoinRequest(selectedTeam.id, requestId, accessToken);
      }
    } catch {
      // Fallback
    }

    setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    Alert.alert('Declined', 'Join request was declined.');
  };

  // ── 7. Team Challenges ─────────────────────────────────────────────────────
  const handleCreateChallenge = async () => {
    if (!selectedTeam) return;
    const targetTeam = teams.find((t) => t.id === formChallengeTargetId);
    if (!targetTeam) {
      Alert.alert('Required', 'Please select an opponent team to challenge');
      return;
    }

    const newCh: TeamChallenge = {
      id: `ch-${Date.now()}`,
      challengerTeamId: selectedTeam.id,
      challengedTeamId: targetTeam.id,
      sportType: selectedTeam.sportType,
      proposedMatchDate: formChallengeDate,
      venueName: formChallengeVenue.trim() || 'Colombo Oval',
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
      challengerTeam: selectedTeam,
      challengedTeam: targetTeam,
    };

    try {
      if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
        await teamService.createChallenge(
          selectedTeam.id,
          {
            challengedTeamId: targetTeam.id,
            sportType: selectedTeam.sportType,
            proposedMatchDate: formChallengeDate,
            venueId: undefined,
          },
          accessToken,
        );
      }
    } catch {
      // Fallback
    }

    setChallenges((prev) => [newCh, ...prev]);
    setChallengeModal(false);
    Alert.alert('Challenge Dispatched', `Match challenge issued to ${targetTeam.teamName}!`);
  };

  // ── 8. Challenge Responses ─────────────────────────────────────────────────
  const handleChallengeResponse = async (challenge: TeamChallenge, accept: boolean) => {
    const nextStatus = accept ? 'ACCEPTED' : 'DECLINED';

    try {
      if (accessToken && !challenge.id.startsWith('ch-')) {
        await teamService.respondToChallenge(
          challenge.challengedTeamId,
          challenge.id,
          nextStatus,
          accessToken,
        );
      }
    } catch {
      // Fallback
    }

    setChallenges((prev) =>
      prev.map((c) => (c.id === challenge.id ? { ...c, status: nextStatus } : c))
    );

    Alert.alert(
      accept ? 'Challenge Accepted ⚔️' : 'Challenge Declined',
      accept
        ? `Match scheduled against ${challenge.challengerTeam?.teamName || 'the challenger'}! Prepare your squad.`
        : 'The match challenge was declined.'
    );
  };

  // Filtered views
  const myTeams = teams.filter((t) => isManagerOfTeam(t));
  const otherTeams = teams.filter((t) => !isManagerOfTeam(t));

  return (
    <View style={s.container}>
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {Boolean(onBack) && (
            <TouchableOpacity onPress={onBack} style={{ paddingVertical: 4, paddingRight: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#6B7280' }}>✕ Close</Text>
            </TouchableOpacity>
          )}
          <Text style={s.headerTitle}>Teams & Squads</Text>
        </View>
        <TouchableOpacity style={s.createBtn} onPress={() => setCreateTeamModal(true)}>
          <Text style={s.createBtnText}>＋ Create Team</Text>
        </TouchableOpacity>
      </View>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <View style={s.navTabs}>
        <TouchableOpacity
          style={[s.navTab, mainTab === 'my_teams' && s.navTabActive]}
          onPress={() => setMainTab('my_teams')}
        >
          <Text style={[s.navTabText, mainTab === 'my_teams' && s.navTabTextActive]}>
            My Squads ({myTeams.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.navTab, mainTab === 'browse' && s.navTabActive]}
          onPress={() => setMainTab('browse')}
        >
          <Text style={[s.navTabText, mainTab === 'browse' && s.navTabTextActive]}>
            Explore Teams ({otherTeams.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.navTab, mainTab === 'challenges' && s.navTabActive]}
          onPress={() => setMainTab('challenges')}
        >
          <Text style={[s.navTabText, mainTab === 'challenges' && s.navTabTextActive]}>
            Challenges ({challenges.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Main Tab Content ────────────────────────────────────────────────── */}
      <ScrollView
        style={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* TAB 1: MY TEAMS */}
        {mainTab === 'my_teams' && (
          <View style={s.section}>
            {myTeams.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyTitle}>You haven't created a squad yet</Text>
                <Text style={s.emptySub}>Build your sports team, recruit squad players, manage roster, and issue match challenges.</Text>
                <TouchableOpacity style={s.primaryBtn} onPress={() => setCreateTeamModal(true)}>
                  <Text style={s.primaryBtnText}>Create Your First Team</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myTeams.map((team) => (
                <View key={team.id} style={s.teamCard}>
                  <View style={s.teamCardHeader}>
                    <View style={s.sportTag}>
                      <Text style={s.sportTagText}>{team.sportType}</Text>
                    </View>
                    <View style={s.cityTag}>
                      <Text style={s.cityTagText}>📍 {team.primaryLocationCity || 'Colombo'}</Text>
                    </View>
                  </View>
                  <Text style={s.teamName}>{team.teamName}</Text>
                  {Boolean(team.teamBio) && <Text style={s.teamBio} numberOfLines={2}>{team.teamBio}</Text>}
                  <View style={s.teamMeta}>
                    <Text style={s.metaText}>Manager: <Text style={s.metaBold}>{team.manager?.displayName || userName}</Text></Text>
                    <Text style={s.metaDot}>·</Text>
                    <Text style={s.metaText}>{team.members?.length || team.playersCount || 1} Roster Players</Text>
                  </View>
                  <View style={s.teamCardActions}>
                    <TouchableOpacity
                      style={s.outlineActionBtn}
                      onPress={() => {
                        setSelectedTeam(team);
                        setTeamProfileTab('roster');
                      }}
                    >
                      <Text style={s.outlineActionText}>View Full Profile & Roster →</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.primaryActionBtn}
                      onPress={() => {
                        setSelectedTeam(team);
                        setFormChallengeTargetId('');
                        setChallengeModal(true);
                      }}
                    >
                      <Text style={s.primaryActionText}>Issue Challenge ⚔️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: EXPLORE TEAMS */}
        {mainTab === 'browse' && (
          <View style={s.section}>
            <View style={s.searchWrap}>
              <TextInput
                style={s.searchInput}
                placeholder="Search teams by name, sport, or city..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {otherTeams.map((team) => (
              <View key={team.id} style={s.teamCard}>
                <View style={s.teamCardHeader}>
                  <View style={s.sportTag}>
                    <Text style={s.sportTagText}>{team.sportType}</Text>
                  </View>
                  <View style={s.cityTag}>
                    <Text style={s.cityTagText}>📍 {team.primaryLocationCity || 'Sri Lanka'}</Text>
                  </View>
                </View>
                <Text style={s.teamName}>{team.teamName}</Text>
                {Boolean(team.teamBio) && <Text style={s.teamBio} numberOfLines={2}>{team.teamBio}</Text>}
                <View style={s.teamMeta}>
                  <Text style={s.metaText}>Manager: <Text style={s.metaBold}>{team.manager?.displayName || 'Sports Club'}</Text></Text>
                  <Text style={s.metaDot}>·</Text>
                  <Text style={s.metaText}>{team.playersCount || team.members?.length || 1} Players</Text>
                </View>
                <View style={s.teamCardActions}>
                  <TouchableOpacity
                    style={s.outlineActionBtn}
                    onPress={() => {
                      setSelectedTeam(team);
                      setTeamProfileTab('roster');
                    }}
                  >
                    <Text style={s.outlineActionText}>View Team Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.primaryActionBtn}
                    onPress={() => handleSendJoinRequest(team)}
                  >
                    <Text style={s.primaryActionText}>Request to Join ＋</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: CHALLENGES */}
        {mainTab === 'challenges' && (
          <View style={s.section}>
            <View style={s.infoBanner}>
              <Text style={s.infoBannerTitle}>Grassroots Team Challenges ⚔️</Text>
              <Text style={s.infoBannerSub}>Challenge rival squads to sanctioned grassroots fixtures and track match responses.</Text>
            </View>

            {challenges.map((ch) => {
              const isChallenged = myTeams.some((t) => t.id === ch.challengedTeamId);
              const challengerName = ch.challengerTeam?.teamName || 'Challenger XI';
              const challengedName = ch.challengedTeam?.teamName || 'Opponent XI';

              return (
                <View key={ch.id} style={s.challengeCard}>
                  <View style={s.challengeHeader}>
                    <Text style={s.challengeSport}>{ch.sportType} FIXTURE</Text>
                    <View
                      style={[
                        s.statusChip,
                        ch.status === 'ACCEPTED' && s.statusChipAccepted,
                        ch.status === 'DECLINED' && s.statusChipDeclined,
                      ]}
                    >
                      <Text
                        style={[
                          s.statusChipText,
                          ch.status === 'ACCEPTED' && s.statusChipTextAccepted,
                          ch.status === 'DECLINED' && s.statusChipTextDeclined,
                        ]}
                      >
                        {ch.status}
                      </Text>
                    </View>
                  </View>

                  <View style={s.matchupRow}>
                    <Text style={s.matchupTeam} numberOfLines={1}>{challengerName}</Text>
                    <Text style={s.matchupVs}>VS</Text>
                    <Text style={s.matchupTeam} numberOfLines={1}>{challengedName}</Text>
                  </View>

                  <View style={s.matchupMeta}>
                    <Text style={s.matchupMetaText}>🏟️ {ch.venueName || 'Local Ground'}</Text>
                    <Text style={s.matchupMetaText}>📅 {new Date(ch.proposedMatchDate).toDateString()}</Text>
                  </View>

                  {/* Accept / Decline actions if challenge is pending for my team */}
                  {ch.status === 'PENDING' && isChallenged && (
                    <View style={s.challengeActionsRow}>
                      <TouchableOpacity
                        style={s.acceptBtn}
                        onPress={() => handleChallengeResponse(ch, true)}
                      >
                        <Text style={s.acceptBtnText}>Accept Challenge</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.declineBtn}
                        onPress={() => handleChallengeResponse(ch, false)}
                      >
                        <Text style={s.declineBtnText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── MODAL: 2. Full Team Profile Screen ─────────────────────────────── */}
      <Modal visible={Boolean(selectedTeam && !createTeamModal && !editTeamModal && !addMemberModal && !editMemberModal && !inviteModal && !challengeModal)} animationType="slide">
        {selectedTeam && (
          <View style={s.fullModalContainer}>
            {/* Header */}
            <View style={s.profileHeaderBar}>
              <TouchableOpacity onPress={() => setSelectedTeam(null)} style={s.backBtn}>
                <Text style={s.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <Text style={s.profileHeaderBarTitle}>Team Profile</Text>
              {isManagerOfTeam(selectedTeam) ? (
                <TouchableOpacity
                  onPress={() => {
                    setFormTeamName(selectedTeam.teamName);
                    setFormCity(selectedTeam.primaryLocationCity || 'Colombo');
                    setFormBio(selectedTeam.teamBio || '');
                    setEditTeamModal(true);
                  }}
                  style={s.editBtn}
                >
                  <Text style={s.editBtnText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 40 }} />
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Hero */}
              <View style={s.profileHero}>
                <View style={s.profileBadge}>
                  <Text style={s.profileBadgeText}>{selectedTeam.teamName.slice(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={s.profileTitle}>{selectedTeam.teamName}</Text>
                <View style={s.profileMetaRow}>
                  <View style={s.sportTag}><Text style={s.sportTagText}>{selectedTeam.sportType}</Text></View>
                  <Text style={s.profileLocation}>📍 {selectedTeam.primaryLocationCity || 'Colombo'}</Text>
                  <View style={s.statusTag}><Text style={s.statusTagText}>{selectedTeam.status}</Text></View>
                </View>
                <Text style={s.profileBio}>{selectedTeam.teamBio || 'No team bio provided.'}</Text>
                <Text style={s.profileManager}>Manager: <Text style={{ fontWeight: '700' }}>{selectedTeam.manager?.displayName || userName}</Text></Text>

                {/* Manager Quick Actions */}
                {isManagerOfTeam(selectedTeam) ? (
                  <View style={s.profileActionsRow}>
                    <TouchableOpacity style={s.profileActionBtn} onPress={() => setAddMemberModal(true)}>
                      <Text style={s.profileActionText}>＋ Add Player</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.profileActionBtn} onPress={() => setInviteModal(true)}>
                      <Text style={s.profileActionText}>✉️ Invite Player</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.profileActionBtn, { backgroundColor: '#111827' }]}
                      onPress={() => {
                        setFormChallengeTargetId('');
                        setChallengeModal(true);
                      }}
                    >
                      <Text style={[s.profileActionText, { color: '#FFFFFF' }]}>⚔️ Challenge</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[s.profileActionBtn, { backgroundColor: '#059669', alignSelf: 'stretch', marginTop: 12 }]}
                    onPress={() => handleSendJoinRequest(selectedTeam)}
                  >
                    <Text style={[s.profileActionText, { color: '#FFFFFF' }]}>Request to Join Squad ＋</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Sub Navigation Bar within Profile */}
              <View style={s.profileSubTabs}>
                <TouchableOpacity
                  style={[s.profileSubTab, teamProfileTab === 'roster' && s.profileSubTabActive]}
                  onPress={() => setTeamProfileTab('roster')}
                >
                  <Text style={[s.profileSubTabText, teamProfileTab === 'roster' && s.profileSubTabTextActive]}>
                    Roster ({selectedTeam.members?.length || 0})
                  </Text>
                </TouchableOpacity>

                {isManagerOfTeam(selectedTeam) && (
                  <TouchableOpacity
                    style={[s.profileSubTab, teamProfileTab === 'join_requests' && s.profileSubTabActive]}
                    onPress={() => setTeamProfileTab('join_requests')}
                  >
                    <Text style={[s.profileSubTabText, teamProfileTab === 'join_requests' && s.profileSubTabTextActive]}>
                      Join Requests ({joinRequests.length})
                    </Text>
                  </TouchableOpacity>
                )}

                {isManagerOfTeam(selectedTeam) && (
                  <TouchableOpacity
                    style={[s.profileSubTab, teamProfileTab === 'invitations' && s.profileSubTabActive]}
                    onPress={() => setTeamProfileTab('invitations')}
                  >
                    <Text style={[s.profileSubTabText, teamProfileTab === 'invitations' && s.profileSubTabTextActive]}>
                      Invitations ({invitations.length})
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[s.profileSubTab, teamProfileTab === 'challenges' && s.profileSubTabActive]}
                  onPress={() => setTeamProfileTab('challenges')}
                >
                  <Text style={[s.profileSubTabText, teamProfileTab === 'challenges' && s.profileSubTabTextActive]}>
                    Matches
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TAB CONTENT: 3. ROSTER */}
              {teamProfileTab === 'roster' && (
                <View style={s.profileTabContent}>
                  {(selectedTeam.members || []).map((m) => (
                    <View key={m.id} style={s.memberCard}>
                      <View style={s.memberAvatar}>
                        <Text style={s.memberAvatarText}>
                          {(m.user?.displayName || 'P').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                        </Text>
                      </View>
                      <View style={s.memberInfo}>
                        <Text style={s.memberName}>{m.user?.displayName || 'Player'}</Text>
                        <View style={s.memberRoleRow}>
                          <View
                            style={[
                              s.roleChip,
                              m.memberRole === 'CAPTAIN' && s.roleChipCaptain,
                              m.memberRole === 'VICE_CAPTAIN' && s.roleChipVice,
                            ]}
                          >
                            <Text
                              style={[
                                s.roleChipText,
                                m.memberRole === 'CAPTAIN' && s.roleChipTextCaptain,
                                m.memberRole === 'VICE_CAPTAIN' && s.roleChipTextVice,
                              ]}
                            >
                              {m.memberRole.replace('_', ' ')}
                            </Text>
                          </View>
                          {Boolean(m.jerseyNumber) && (
                            <Text style={s.jerseyText}>#{m.jerseyNumber}</Text>
                          )}
                        </View>
                      </View>

                      {isManagerOfTeam(selectedTeam) && (
                        <View style={s.memberActions}>
                          <TouchableOpacity
                            style={s.editMemberBtn}
                            onPress={() => {
                              setSelectedMember(m);
                              setFormMemberRole(m.memberRole);
                              setFormJersey(m.jerseyNumber ? String(m.jerseyNumber) : '');
                              setEditMemberModal(true);
                            }}
                          >
                            <Text style={s.editMemberText}>Role</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={s.removeMemberBtn}
                            onPress={() => handleRemoveMember(m)}
                          >
                            <Text style={s.removeMemberText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* TAB CONTENT: 6. JOIN REQUESTS */}
              {teamProfileTab === 'join_requests' && (
                <View style={s.profileTabContent}>
                  {joinRequests.length === 0 ? (
                    <View style={s.emptySmall}>
                      <Text style={s.emptySmallText}>No pending player join requests</Text>
                    </View>
                  ) : (
                    joinRequests.map((req) => (
                      <View key={req.id} style={s.requestCard}>
                        <View style={s.requestInfo}>
                          <Text style={s.requestName}>{req.invitedUser?.displayName || 'Interested Player'}</Text>
                          <Text style={s.requestDate}>Requested on {req.createdAt}</Text>
                        </View>
                        <View style={s.requestActions}>
                          <TouchableOpacity
                            style={s.acceptRequestBtn}
                            onPress={() => handleAcceptJoinRequest(req)}
                          >
                            <Text style={s.acceptRequestText}>Accept to Squad</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={s.rejectRequestBtn}
                            onPress={() => handleRejectJoinRequest(req.id)}
                          >
                            <Text style={s.rejectRequestText}>Decline</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* TAB CONTENT: 5. INVITATIONS */}
              {teamProfileTab === 'invitations' && (
                <View style={s.profileTabContent}>
                  <TouchableOpacity style={s.inviteBannerBtn} onPress={() => setInviteModal(true)}>
                    <Text style={s.inviteBannerBtnText}>＋ Send New Player Invitation</Text>
                  </TouchableOpacity>

                  {invitations.length === 0 ? (
                    <View style={s.emptySmall}>
                      <Text style={s.emptySmallText}>No active invitations sent</Text>
                    </View>
                  ) : (
                    invitations.map((inv) => (
                      <View key={inv.id} style={s.requestCard}>
                        <View style={s.requestInfo}>
                          <Text style={s.requestName}>{inv.invitedUser?.displayName || inv.invitedUserId}</Text>
                          <Text style={s.requestDate}>Status: PENDING · Sent {inv.createdAt}</Text>
                        </View>
                        <TouchableOpacity
                          style={s.cancelInviteBtn}
                          onPress={() => handleCancelInvitation(inv.id)}
                        >
                          <Text style={s.cancelInviteText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* TAB CONTENT: 7 & 8. MATCH CHALLENGES */}
              {teamProfileTab === 'challenges' && (
                <View style={s.profileTabContent}>
                  <TouchableOpacity
                    style={s.inviteBannerBtn}
                    onPress={() => {
                      setFormChallengeTargetId('');
                      setChallengeModal(true);
                    }}
                  >
                    <Text style={s.inviteBannerBtnText}>⚔️ Issue Match Challenge to Opponent</Text>
                  </TouchableOpacity>

                  {challenges
                    .filter((c) => c.challengerTeamId === selectedTeam.id || c.challengedTeamId === selectedTeam.id)
                    .map((ch) => (
                      <View key={ch.id} style={s.challengeCard}>
                        <View style={s.challengeHeader}>
                          <Text style={s.challengeSport}>{ch.sportType}</Text>
                          <View
                            style={[
                              s.statusChip,
                              ch.status === 'ACCEPTED' && s.statusChipAccepted,
                              ch.status === 'DECLINED' && s.statusChipDeclined,
                            ]}
                          >
                            <Text
                              style={[
                                s.statusChipText,
                                ch.status === 'ACCEPTED' && s.statusChipTextAccepted,
                                ch.status === 'DECLINED' && s.statusChipTextDeclined,
                              ]}
                            >
                              {ch.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={s.matchupRowText}>
                          {ch.challengerTeam?.teamName} vs {ch.challengedTeam?.teamName}
                        </Text>
                        <Text style={s.detailItem}>🏟️ {ch.venueName}</Text>
                        <Text style={s.detailItem}>📅 {new Date(ch.proposedMatchDate).toDateString()}</Text>

                        {/* Accept / Decline actions if challenge received */}
                        {ch.status === 'PENDING' && ch.challengedTeamId === selectedTeam.id && (
                          <View style={s.challengeActionsRow}>
                            <TouchableOpacity
                              style={s.acceptBtn}
                              onPress={() => handleChallengeResponse(ch, true)}
                            >
                              <Text style={s.acceptBtnText}>Accept Challenge</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={s.declineBtn}
                              onPress={() => handleChallengeResponse(ch, false)}
                            >
                              <Text style={s.declineBtnText}>Decline</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ── MODAL: 1. Create Team Form ─────────────────────────────────────── */}
      <Modal visible={createTeamModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Establish Sports Team</Text>
            <Text style={s.modalSub}>Create your grassroots squad, register roster players, and challenge rivals.</Text>

            <Text style={s.inputLabel}>TEAM NAME *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Colombo Falcons CC"
              value={formTeamName}
              onChangeText={setFormTeamName}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={s.inputLabel}>SPORT TYPE *</Text>
            <View style={s.chipGroup}>
              {(['CRICKET', 'FOOTBALL', 'BADMINTON', 'BASKETBALL', 'VOLLEYBALL'] as SportType[]).map((sp) => (
                <TouchableOpacity
                  key={sp}
                  style={[s.chip, formSportType === sp && s.chipActive]}
                  onPress={() => setFormSportType(sp)}
                >
                  <Text style={[s.chipText, formSportType === sp && s.chipTextActive]}>{sp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.inputLabel}>HOME CITY</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Colombo"
              value={formCity}
              onChangeText={setFormCity}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={s.inputLabel}>TEAM BIO / DESCRIPTION</Text>
            <TextInput
              style={[s.input, s.inputMulti]}
              placeholder="Share details about training sessions, home ground, and team goals..."
              multiline
              numberOfLines={3}
              value={formBio}
              onChangeText={setFormBio}
              placeholderTextColor="#9CA3AF"
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setCreateTeamModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSubmit} onPress={handleCreateTeam}>
                <Text style={s.modalSubmitText}>Create Team</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: 1b. Edit Team Profile ───────────────────────────────────── */}
      <Modal visible={editTeamModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Edit Team Profile</Text>

            <Text style={s.inputLabel}>TEAM NAME</Text>
            <TextInput
              style={s.input}
              value={formTeamName}
              onChangeText={setFormTeamName}
            />

            <Text style={s.inputLabel}>HOME CITY</Text>
            <TextInput
              style={s.input}
              value={formCity}
              onChangeText={setFormCity}
            />

            <Text style={s.inputLabel}>BIO / DESCRIPTION</Text>
            <TextInput
              style={[s.input, s.inputMulti]}
              multiline
              value={formBio}
              onChangeText={setFormBio}
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setEditTeamModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSubmit} onPress={handleUpdateTeamProfile}>
                <Text style={s.modalSubmitText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: 4. Add Player to Roster ──────────────────────────────────── */}
      <Modal visible={addMemberModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Add Player to Squad</Text>
            <Text style={s.modalSub}>Add an athlete directly to the team's active roster.</Text>

            <Text style={s.inputLabel}>PLAYER NAME / USERNAME *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Sanath Jayasuriya"
              value={formMemberName}
              onChangeText={setFormMemberName}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={s.inputLabel}>SQUAD ROLE</Text>
            <View style={s.chipGroup}>
              {(['CAPTAIN', 'VICE_CAPTAIN', 'SQUAD_PLAYER'] as TeamMemberRole[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[s.chip, formMemberRole === r && s.chipActive]}
                  onPress={() => setFormMemberRole(r)}
                >
                  <Text style={[s.chipText, formMemberRole === r && s.chipTextActive]}>
                    {r.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.inputLabel}>JERSEY NUMBER</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 7"
              keyboardType="number-pad"
              value={formJersey}
              onChangeText={setFormJersey}
              placeholderTextColor="#9CA3AF"
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setAddMemberModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSubmit} onPress={handleAddMember}>
                <Text style={s.modalSubmitText}>Add to Roster</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: 4b. Update Role & Jersey ─────────────────────────────────── */}
      <Modal visible={editMemberModal} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Update Roster Role</Text>
            <Text style={s.modalSub}>Adjust member role and jersey number for {selectedMember?.user?.displayName}.</Text>

            <Text style={s.inputLabel}>SQUAD ROLE</Text>
            <View style={s.chipGroup}>
              {(['CAPTAIN', 'VICE_CAPTAIN', 'SQUAD_PLAYER'] as TeamMemberRole[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[s.chip, formMemberRole === r && s.chipActive]}
                  onPress={() => setFormMemberRole(r)}
                >
                  <Text style={[s.chipText, formMemberRole === r && s.chipTextActive]}>
                    {r.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.inputLabel}>JERSEY NUMBER</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 10"
              keyboardType="number-pad"
              value={formJersey}
              onChangeText={setFormJersey}
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setEditMemberModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSubmit} onPress={handleUpdateMemberRole}>
                <Text style={s.modalSubmitText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: 5. Invite Player ─────────────────────────────────────────── */}
      <Modal visible={inviteModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Invite Player to Team</Text>
            <Text style={s.modalSub}>Send a squad invitation to an athlete on SportLK.</Text>

            <Text style={s.inputLabel}>PLAYER USERNAME OR EMAIL *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. mahela@sportlk.com"
              value={formInviteUser}
              onChangeText={setFormInviteUser}
              placeholderTextColor="#9CA3AF"
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setInviteModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSubmit} onPress={handleSendInvitation}>
                <Text style={s.modalSubmitText}>Send Invitation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: 7. Issue Challenge ──────────────────────────────────────── */}
      <Modal visible={challengeModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Issue Match Challenge</Text>
            <Text style={s.modalSub}>Set date, venue, and challenge an opponent club to a fixture.</Text>

            <Text style={s.inputLabel}>OPPONENT TEAM *</Text>
            <ScrollView style={{ maxHeight: 120, marginBottom: 10 }} showsVerticalScrollIndicator={false}>
              {teams
                .filter((t) => t.id !== selectedTeam?.id)
                .map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[s.opponentItem, formChallengeTargetId === t.id && s.opponentItemActive]}
                    onPress={() => setFormChallengeTargetId(t.id)}
                  >
                    <Text style={[s.opponentItemText, formChallengeTargetId === t.id && s.opponentItemTextActive]}>
                      {t.teamName} ({t.sportType})
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={s.inputLabel}>MATCH VENUE / GROUND</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Colombo Oval"
              value={formChallengeVenue}
              onChangeText={setFormChallengeVenue}
            />

            <Text style={s.inputLabel}>PROPOSED DATE & TIME</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 2026-11-25T15:00:00Z"
              value={formChallengeDate}
              onChangeText={setFormChallengeDate}
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setChallengeModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSubmit} onPress={handleCreateChallenge}>
                <Text style={s.modalSubmitText}>Dispatch Challenge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerKicker: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: '#059669' },
  headerTitle: { fontSize: 19, fontWeight: '800', color: '#111827' },
  createBtn: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  createBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  navTabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 12 },
  navTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  navTabActive: { borderBottomWidth: 2, borderBottomColor: '#059669' },
  navTabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  navTabTextActive: { color: '#059669', fontWeight: '800' },
  content: { flex: 1, padding: 16 },
  section: { paddingBottom: 40 },
  searchWrap: { marginBottom: 12 },
  searchInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#111827' },
  emptyBox: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', marginTop: 14 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptySub: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 17, marginBottom: 16 },
  primaryBtn: { backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  teamCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  teamCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sportTag: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  sportTagText: { color: '#059669', fontSize: 10, fontWeight: '800' },
  cityTag: { paddingHorizontal: 4, paddingVertical: 3 },
  cityTagText: { color: '#6B7280', fontSize: 11, fontWeight: '500' },
  teamName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  teamBio: { fontSize: 12, color: '#4B5563', lineHeight: 17, marginBottom: 10 },
  teamMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metaText: { fontSize: 11, color: '#6B7280' },
  metaBold: { fontWeight: '700', color: '#374151' },
  metaDot: { marginHorizontal: 6, color: '#9CA3AF' },
  teamCardActions: { flexDirection: 'row', gap: 8 },
  outlineActionBtn: { flex: 1.4, borderWidth: 1, borderColor: '#D1D5DB', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  outlineActionText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  primaryActionBtn: { flex: 1, backgroundColor: '#059669', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  primaryActionText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  // Challenges View
  infoBanner: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
  infoBannerTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  infoBannerSub: { fontSize: 11, color: '#78350F', lineHeight: 15 },
  challengeCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  challengeSport: { fontSize: 10, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  statusChip: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusChipAccepted: { backgroundColor: '#D1FAE5' },
  statusChipDeclined: { backgroundColor: '#FEE2E2' },
  statusChipText: { fontSize: 9, fontWeight: '800', color: '#B45309' },
  statusChipTextAccepted: { color: '#065F46' },
  statusChipTextDeclined: { color: '#991B1B' },
  matchupRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', marginBottom: 8 },
  matchupTeam: { flex: 1, fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'center' },
  matchupVs: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', paddingHorizontal: 6 },
  matchupRowText: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  matchupMeta: { gap: 3, marginBottom: 8 },
  matchupMetaText: { fontSize: 11, color: '#4B5563' },
  detailItem: { fontSize: 11, color: '#4B5563' },
  challengeActionsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  acceptBtn: { flex: 1, backgroundColor: '#059669', paddingVertical: 7, borderRadius: 6, alignItems: 'center' },
  acceptBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  declineBtn: { borderWidth: 1, borderColor: '#DC2626', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6, alignItems: 'center' },
  declineBtnText: { color: '#DC2626', fontSize: 11, fontWeight: '600' },

  // Full Screen Team Profile View
  fullModalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  profileHeaderBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 13, fontWeight: '700', color: '#059669' },
  profileHeaderBarTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  editBtn: { padding: 4 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  profileHero: { padding: 16, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'center' },
  profileBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  profileBadgeText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  profileTitle: { fontSize: 19, fontWeight: '800', color: '#111827', marginBottom: 4, textAlign: 'center' },
  profileMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  profileLocation: { fontSize: 12, color: '#6B7280' },
  statusTag: { backgroundColor: '#E0E7FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusTagText: { fontSize: 9, fontWeight: '700', color: '#3730A3' },
  profileBio: { fontSize: 12, color: '#4B5563', textAlign: 'center', lineHeight: 17, marginBottom: 8, paddingHorizontal: 10 },
  profileManager: { fontSize: 11, color: '#6B7280' },
  profileActionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  profileActionBtn: { backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  profileActionText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  profileSubTabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 8 },
  profileSubTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  profileSubTabActive: { borderBottomWidth: 2, borderBottomColor: '#059669' },
  profileSubTabText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  profileSubTabTextActive: { color: '#059669', fontWeight: '800' },
  profileTabContent: { padding: 16 },

  // Roster View
  memberCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  memberAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  memberAvatarText: { fontSize: 11, fontWeight: '800', color: '#374151' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  memberRoleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  roleChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleChipCaptain: { backgroundColor: '#FEF3C7' },
  roleChipVice: { backgroundColor: '#D1FAE5' },
  roleChipText: { fontSize: 9, fontWeight: '700', color: '#6B7280' },
  roleChipTextCaptain: { color: '#B45309' },
  roleChipTextVice: { color: '#065F46' },
  jerseyText: { fontSize: 10, fontWeight: '700', color: '#374151' },
  memberActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  editMemberBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#F3F4F6' },
  editMemberText: { fontSize: 10, fontWeight: '600', color: '#4B5563' },
  removeMemberBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  removeMemberText: { fontSize: 12, color: '#DC2626', fontWeight: '800' },

  // Join Requests & Invitations
  emptySmall: { padding: 20, alignItems: 'center' },
  emptySmallText: { fontSize: 12, color: '#9CA3AF' },
  requestCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#F9FAFB', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  requestDate: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 6 },
  acceptRequestBtn: { backgroundColor: '#059669', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  acceptRequestText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  rejectRequestBtn: { borderWidth: 1, borderColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  rejectRequestText: { color: '#DC2626', fontSize: 10, fontWeight: '600' },
  inviteBannerBtn: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  inviteBannerBtnText: { color: '#065F46', fontSize: 12, fontWeight: '700' },
  cancelInviteBtn: { borderWidth: 1, borderColor: '#D1D5DB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  cancelInviteText: { color: '#6B7280', fontSize: 10, fontWeight: '600' },

  // Forms & Dialog Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  modalBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, width: '100%', maxWidth: 520, maxHeight: '90%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
  modalSub: { fontSize: 11, color: '#6B7280', lineHeight: 15, marginBottom: 12 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: '#4B5563', marginBottom: 5, marginTop: 8, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#111827', backgroundColor: '#F9FAFB' },
  inputMulti: { height: 60, textAlignVertical: 'top' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, backgroundColor: '#F3F4F6' },
  chipActive: { backgroundColor: '#059669' },
  chipText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  opponentItem: { padding: 9, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 6 },
  opponentItemActive: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  opponentItemText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  opponentItemTextActive: { color: '#059669', fontWeight: '700' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  modalCancel: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  modalCancelText: { color: '#6B7280', fontWeight: '600', fontSize: 12 },
  modalSubmit: { backgroundColor: '#059669', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  modalSubmitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
