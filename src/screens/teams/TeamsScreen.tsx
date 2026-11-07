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
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { apiRequest } from '../../api';
import { useAuth } from '../../context/AuthContext';

export interface TeamMember {
  id: string;
  name: string;
  role: 'Captain' | 'Vice-Captain' | 'Player' | 'Coach';
  jerseyNumber?: number;
  joinedAt?: string;
}

export interface TeamChallenge {
  id: string;
  challengerTeam: string;
  targetTeam: string;
  sport: string;
  venue: string;
  date: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
}

export interface TeamItem {
  id: string;
  name: string;
  sport: string;
  city: string;
  bio?: string;
  managerName?: string;
  membersCount: number;
  members: TeamMember[];
  isMyTeam?: boolean;
}

const DEMO_TEAMS: TeamItem[] = [
  {
    id: 'team-demo-1',
    name: 'Colombo Lions Cricket Club',
    sport: 'Cricket',
    city: 'Colombo',
    bio: 'Premier grassroots cricket club competing in Colombo Division tournaments.',
    managerName: 'Avishka Perera',
    membersCount: 15,
    isMyTeam: true,
    members: [
      { id: 'm-1', name: 'Avishka Perera', role: 'Captain', jerseyNumber: 7 },
      { id: 'm-2', name: 'Kusal Silva', role: 'Vice-Captain', jerseyNumber: 18 },
      { id: 'm-3', name: 'Dinesh Mendis', role: 'Player', jerseyNumber: 45 },
      { id: 'm-4', name: 'Nuwan Pradeep', role: 'Player', jerseyNumber: 99 },
      { id: 'm-5', name: 'Sanath Fernando', role: 'Coach', jerseyNumber: 1 },
    ],
  },
  {
    id: 'team-demo-2',
    name: 'Kandy Thunder Futsal',
    sport: 'Football',
    city: 'Kandy',
    bio: 'Fast-paced 5v5 futsal squad training at Kandy Sports Complex.',
    managerName: 'Roshan De Silva',
    membersCount: 8,
    isMyTeam: false,
    members: [
      { id: 'm-6', name: 'Roshan De Silva', role: 'Captain', jerseyNumber: 10 },
      { id: 'm-7', name: 'Kasun Bandara', role: 'Player', jerseyNumber: 9 },
      { id: 'm-8', name: 'Tharindu Gamage', role: 'Player', jerseyNumber: 3 },
    ],
  },
  {
    id: 'team-demo-3',
    name: 'Galle Smashers Badminton',
    sport: 'Badminton',
    city: 'Galle',
    bio: 'Competitive doubles and singles badminton squad based in Galle.',
    managerName: 'Kamal Jayawardena',
    membersCount: 6,
    isMyTeam: false,
    members: [
      { id: 'm-9', name: 'Kamal Jayawardena', role: 'Captain' },
      { id: 'm-10', name: 'Sahan Wickrama', role: 'Player' },
    ],
  },
];

const DEMO_CHALLENGES: TeamChallenge[] = [
  {
    id: 'ch-1',
    challengerTeam: 'Kandy Thunder Futsal',
    targetTeam: 'Colombo Lions Cricket Club',
    sport: 'Football',
    venue: 'CR&FC Grounds, Colombo',
    date: 'Saturday, Nov 14, 2026',
    status: 'PENDING',
  },
  {
    id: 'ch-2',
    challengerTeam: 'Colombo Lions Cricket Club',
    targetTeam: 'Negombo Strikers CC',
    sport: 'Cricket',
    venue: 'Colombo Oval',
    date: 'Sunday, Nov 22, 2026',
    status: 'ACCEPTED',
  },
];

interface TeamsScreenProps {
  onBack?: () => void;
}

export default function TeamsScreen({ onBack }: TeamsScreenProps) {
  const { accessToken, userName } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'my_teams' | 'browse' | 'challenges'>('my_teams');
  const [teams, setTeams] = useState<TeamItem[]>(DEMO_TEAMS);
  const [challenges, setChallenges] = useState<TeamChallenge[]>(DEMO_CHALLENGES);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [createTeamModal, setCreateTeamModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamItem | null>(null);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [challengeModal, setChallengeModal] = useState(false);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamSport, setTeamSport] = useState('Cricket');
  const [teamCity, setTeamCity] = useState('Colombo');
  const [teamBio, setTeamBio] = useState('');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Captain' | 'Vice-Captain' | 'Player' | 'Coach'>('Player');
  const [newMemberJersey, setNewMemberJersey] = useState('');

  const [challengeTargetTeam, setChallengeTargetTeam] = useState('');
  const [challengeSport, setChallengeSport] = useState('Cricket');
  const [challengeVenue, setChallengeVenue] = useState('Colombo Oval');
  const [challengeDate, setChallengeDate] = useState('Upcoming Weekend');

  const fetchTeams = useCallback(async () => {
    try {
      const data = await apiRequest<any[]>('/teams', {}, accessToken);
      if (Array.isArray(data) && data.length > 0) {
        const mapped: TeamItem[] = data.map((t: any) => ({
          id: t.id,
          name: t.name || t.teamName,
          sport: t.sportType || t.sport || 'Cricket',
          city: t.city || 'Colombo',
          bio: t.description || t.bio || '',
          managerName: t.manager?.displayName || t.managerName || userName,
          membersCount: t.membersCount || (t.members ? t.members.length : 1),
          isMyTeam: t.managerId === userName || true,
          members: Array.isArray(t.members) ? t.members : [],
        }));
        setTeams(mapped);
      }
    } catch {
      // Keep demo teams
    }
  }, [accessToken, userName]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeams();
    setRefreshing(false);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Required', 'Please enter a team name');
      return;
    }

    const newTeam: TeamItem = {
      id: `team-local-${Date.now()}`,
      name: teamName.trim(),
      sport: teamSport,
      city: teamCity.trim() || 'Colombo',
      bio: teamBio.trim(),
      managerName: userName,
      membersCount: 1,
      isMyTeam: true,
      members: [
        {
          id: `m-${Date.now()}`,
          name: userName,
          role: 'Captain',
          jerseyNumber: 1,
        },
      ],
    };

    try {
      if (accessToken) {
        await apiRequest('/teams', {
          method: 'POST',
          body: JSON.stringify({
            teamName: newTeam.name,
            sportType: newTeam.sport.toUpperCase(),
            city: newTeam.city,
            description: newTeam.bio,
          }),
        }, accessToken);
      }
    } catch {
      // Local fallback
    }

    setTeams((prev) => [newTeam, ...prev]);
    setCreateTeamModal(false);
    setTeamName('');
    setTeamBio('');
    Alert.alert('Success', `Team "${newTeam.name}" created successfully!`);
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberName.trim()) {
      Alert.alert('Required', 'Please enter player name');
      return;
    }

    const member: TeamMember = {
      id: `m-loc-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      jerseyNumber: newMemberJersey ? parseInt(newMemberJersey, 10) : undefined,
    };

    try {
      if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
        await apiRequest(`/teams/${selectedTeam.id}/members`, {
          method: 'POST',
          body: JSON.stringify({
            userId: member.name,
            role: member.role,
            jerseyNumber: member.jerseyNumber,
          }),
        }, accessToken);
      }
    } catch {
      // Local fallback
    }

    const updated = {
      ...selectedTeam,
      membersCount: selectedTeam.membersCount + 1,
      members: [...selectedTeam.members, member],
    };

    setSelectedTeam(updated);
    setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setAddMemberModal(false);
    setNewMemberName('');
    setNewMemberJersey('');
    Alert.alert('Member Added', `${member.name} has been added to the squad roster.`);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam) return;

    Alert.alert('Remove Player', 'Are you sure you want to remove this player from the squad?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            if (accessToken && !selectedTeam.id.startsWith('team-demo-')) {
              await apiRequest(`/teams/${selectedTeam.id}/members/${memberId}`, {
                method: 'DELETE',
              }, accessToken);
            }
          } catch {
            // Local fallback
          }

          const updated = {
            ...selectedTeam,
            membersCount: Math.max(1, selectedTeam.membersCount - 1),
            members: selectedTeam.members.filter((m) => m.id !== memberId),
          };
          setSelectedTeam(updated);
          setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        },
      },
    ]);
  };

  const handleCreateChallenge = () => {
    if (!challengeTargetTeam.trim()) {
      Alert.alert('Required', 'Please specify the opponent team');
      return;
    }

    const ch: TeamChallenge = {
      id: `ch-${Date.now()}`,
      challengerTeam: selectedTeam ? selectedTeam.name : userName + ' XI',
      targetTeam: challengeTargetTeam.trim(),
      sport: challengeSport,
      venue: challengeVenue.trim() || 'Local Ground',
      date: challengeDate.trim(),
      status: 'PENDING',
    };

    setChallenges((prev) => [ch, ...prev]);
    setChallengeModal(false);
    setChallengeTargetTeam('');
    Alert.alert('Challenge Sent', `Challenge sent to ${ch.targetTeam}!`);
  };

  const handleChallengeResponse = (id: string, accept: boolean) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: accept ? 'ACCEPTED' : 'DECLINED' } : c
      )
    );
    Alert.alert(
      accept ? 'Challenge Accepted' : 'Challenge Declined',
      accept ? 'Match scheduled! Prepare your squad.' : 'Challenge was declined.'
    );
  };

  const myTeams = teams.filter((t) => t.isMyTeam);
  const otherTeams = teams.filter((t) => !t.isMyTeam);

  return (
    <View style={s.container}>
      {/* Top Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerKicker}>MEMBER 2 MODULE</Text>
          <Text style={s.headerTitle}>Teams & Squads</Text>
        </View>
        <TouchableOpacity style={s.createBtn} onPress={() => setCreateTeamModal(true)}>
          <Text style={s.createBtnText}>＋ Create Team</Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tabs */}
      <View style={s.subTabRow}>
        <TouchableOpacity
          style={[s.subTab, activeSubTab === 'my_teams' && s.subTabActive]}
          onPress={() => setActiveSubTab('my_teams')}
        >
          <Text style={[s.subTabText, activeSubTab === 'my_teams' && s.subTabTextActive]}>
            My Squads ({myTeams.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.subTab, activeSubTab === 'browse' && s.subTabActive]}
          onPress={() => setActiveSubTab('browse')}
        >
          <Text style={[s.subTabText, activeSubTab === 'browse' && s.subTabTextActive]}>
            Browse Teams ({otherTeams.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.subTab, activeSubTab === 'challenges' && s.subTabActive]}
          onPress={() => setActiveSubTab('challenges')}
        >
          <Text style={[s.subTabText, activeSubTab === 'challenges' && s.subTabTextActive]}>
            Challenges ({challenges.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeSubTab === 'my_teams' && (
          <View style={s.section}>
            {myTeams.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyTitle}>No teams created yet</Text>
                <Text style={s.emptySub}>Create your team to manage roster and challenge opponents.</Text>
                <TouchableOpacity style={s.emptyBtn} onPress={() => setCreateTeamModal(true)}>
                  <Text style={s.emptyBtnText}>Create Your First Team</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myTeams.map((team) => (
                <View key={team.id} style={s.teamCard}>
                  <View style={s.teamCardHeader}>
                    <View style={s.sportBadge}>
                      <Text style={s.sportBadgeText}>{team.sport.toUpperCase()}</Text>
                    </View>
                    <View style={s.cityBadge}>
                      <Text style={s.cityBadgeText}>📍 {team.city}</Text>
                    </View>
                  </View>
                  <Text style={s.teamName}>{team.name}</Text>
                  {Boolean(team.bio) && <Text style={s.teamBio}>{team.bio}</Text>}
                  <View style={s.teamMeta}>
                    <Text style={s.metaText}>Manager: <Text style={s.metaBold}>{team.managerName}</Text></Text>
                    <Text style={s.metaDot}>·</Text>
                    <Text style={s.metaText}>{team.membersCount} Roster Players</Text>
                  </View>
                  <View style={s.teamCardActions}>
                    <TouchableOpacity
                      style={s.actionBtnOutline}
                      onPress={() => setSelectedTeam(team)}
                    >
                      <Text style={s.actionBtnOutlineText}>Manage Squad Roster ({team.members.length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.actionBtnPrimary}
                      onPress={() => {
                        setSelectedTeam(team);
                        setChallengeModal(true);
                      }}
                    >
                      <Text style={s.actionBtnPrimaryText}>Issue Challenge ⚔️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeSubTab === 'browse' && (
          <View style={s.section}>
            {otherTeams.map((team) => (
              <View key={team.id} style={s.teamCard}>
                <View style={s.teamCardHeader}>
                  <View style={s.sportBadge}>
                    <Text style={s.sportBadgeText}>{team.sport.toUpperCase()}</Text>
                  </View>
                  <View style={s.cityBadge}>
                    <Text style={s.cityBadgeText}>📍 {team.city}</Text>
                  </View>
                </View>
                <Text style={s.teamName}>{team.name}</Text>
                {Boolean(team.bio) && <Text style={s.teamBio}>{team.bio}</Text>}
                <View style={s.teamMeta}>
                  <Text style={s.metaText}>Manager: <Text style={s.metaBold}>{team.managerName}</Text></Text>
                  <Text style={s.metaDot}>·</Text>
                  <Text style={s.metaText}>{team.membersCount} Active Players</Text>
                </View>
                <View style={s.teamCardActions}>
                  <TouchableOpacity
                    style={s.actionBtnOutline}
                    onPress={() => setSelectedTeam(team)}
                  >
                    <Text style={s.actionBtnOutlineText}>View Squad Roster</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.actionBtnPrimary}
                    onPress={() => {
                      setChallengeTargetTeam(team.name);
                      setChallengeSport(team.sport);
                      setChallengeModal(true);
                    }}
                  >
                    <Text style={s.actionBtnPrimaryText}>Challenge Team</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeSubTab === 'challenges' && (
          <View style={s.section}>
            <View style={s.banner}>
              <Text style={s.bannerTitle}>Grassroots Team Challenges</Text>
              <Text style={s.bannerSub}>Challenge rival squads, confirm venue, and settle scores on the pitch.</Text>
            </View>

            {challenges.map((ch) => (
              <View key={ch.id} style={s.challengeCard}>
                <View style={s.challengeHeader}>
                  <Text style={s.challengeSport}>{ch.sport.toUpperCase()} MATCH</Text>
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
                      ]}
                    >
                      {ch.status}
                    </Text>
                  </View>
                </View>
                <View style={s.matchupRow}>
                  <Text style={s.matchupTeam}>{ch.challengerTeam}</Text>
                  <Text style={s.matchupVs}>VS</Text>
                  <Text style={s.matchupTeam}>{ch.targetTeam}</Text>
                </View>
                <View style={s.matchupDetails}>
                  <Text style={s.detailItem}>🏟️ {ch.venue}</Text>
                  <Text style={s.detailItem}>📅 {ch.date}</Text>
                </View>

                {ch.status === 'PENDING' && (
                  <View style={s.challengeActions}>
                    <TouchableOpacity
                      style={s.acceptBtn}
                      onPress={() => handleChallengeResponse(ch.id, true)}
                    >
                      <Text style={s.acceptBtnText}>Accept Challenge</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.declineBtn}
                      onPress={() => handleChallengeResponse(ch.id, false)}
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

      {/* Modal: Create Team */}
      <Modal visible={createTeamModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Create New Sports Team</Text>
            <Text style={s.modalSub}>Build your squad, invite teammates, and register for tournaments.</Text>

            <Text style={s.inputLabel}>TEAM NAME *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Colombo Falcons CC"
              value={teamName}
              onChangeText={setTeamName}
            />

            <Text style={s.inputLabel}>SPORT *</Text>
            <View style={s.chipGroup}>
              {['Cricket', 'Football', 'Badminton', 'Basketball'].map((sp) => (
                <TouchableOpacity
                  key={sp}
                  style={[s.chip, teamSport === sp && s.chipActive]}
                  onPress={() => setTeamSport(sp)}
                >
                  <Text style={[s.chipText, teamSport === sp && s.chipTextActive]}>{sp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.inputLabel}>HOME CITY</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Colombo"
              value={teamCity}
              onChangeText={setTeamCity}
            />

            <Text style={s.inputLabel}>TEAM DESCRIPTION / BIO</Text>
            <TextInput
              style={[s.input, s.inputMulti]}
              placeholder="Tell others about your squad, training times, and level..."
              multiline
              numberOfLines={3}
              value={teamBio}
              onChangeText={setTeamBio}
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

      {/* Modal: View & Manage Squad Roster */}
      <Modal visible={Boolean(selectedTeam && !challengeModal)} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalBox, { maxHeight: '85%' }]}>
            <View style={s.modalHeaderRow}>
              <View>
                <Text style={s.modalTitle}>{selectedTeam?.name}</Text>
                <Text style={s.modalSub}>
                  {selectedTeam?.sport} · {selectedTeam?.city} · {selectedTeam?.members.length} Players
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTeam(null)}>
                <Text style={s.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={s.rosterActions}>
              <Text style={s.sectionHeader}>Squad Roster</Text>
              {selectedTeam?.isMyTeam && (
                <TouchableOpacity
                  style={s.addPlayerBtn}
                  onPress={() => setAddMemberModal(true)}
                >
                  <Text style={s.addPlayerBtnText}>＋ Add Player</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {selectedTeam?.members.map((m) => (
                <View key={m.id} style={s.memberRow}>
                  <View style={s.memberAvatar}>
                    <Text style={s.memberAvatarText}>
                      {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={s.memberInfo}>
                    <Text style={s.memberName}>{m.name}</Text>
                    <Text style={s.memberRole}>
                      {m.role} {m.jerseyNumber ? `· #${m.jerseyNumber}` : ''}
                    </Text>
                  </View>
                  {selectedTeam?.isMyTeam && (
                    <TouchableOpacity
                      style={s.removeMemberBtn}
                      onPress={() => handleRemoveMember(m.id)}
                    >
                      <Text style={s.removeMemberText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={s.closeBtn} onPress={() => setSelectedTeam(null)}>
              <Text style={s.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Add Member */}
      <Modal visible={addMemberModal} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Add Player to Squad</Text>
            <Text style={s.inputLabel}>PLAYER NAME *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Mahela Jayawardena"
              value={newMemberName}
              onChangeText={setNewMemberName}
            />

            <Text style={s.inputLabel}>SQUAD ROLE</Text>
            <View style={s.chipGroup}>
              {(['Captain', 'Vice-Captain', 'Player', 'Coach'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[s.chip, newMemberRole === r && s.chipActive]}
                  onPress={() => setNewMemberRole(r)}
                >
                  <Text style={[s.chipText, newMemberRole === r && s.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.inputLabel}>JERSEY NUMBER</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 10"
              keyboardType="number-pad"
              value={newMemberJersey}
              onChangeText={setNewMemberJersey}
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

      {/* Modal: Issue Challenge */}
      <Modal visible={challengeModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Issue Match Challenge</Text>
            <Text style={s.modalSub}>Schedule a friendly match or league fixture against an opponent squad.</Text>

            <Text style={s.inputLabel}>OPPONENT TEAM *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Kandy Thunder Futsal"
              value={challengeTargetTeam}
              onChangeText={setChallengeTargetTeam}
            />

            <Text style={s.inputLabel}>SPORT</Text>
            <View style={s.chipGroup}>
              {['Cricket', 'Football', 'Badminton'].map((sp) => (
                <TouchableOpacity
                  key={sp}
                  style={[s.chip, challengeSport === sp && s.chipActive]}
                  onPress={() => setChallengeSport(sp)}
                >
                  <Text style={[s.chipText, challengeSport === sp && s.chipTextActive]}>{sp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.inputLabel}>VENUE / GROUND</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. CR&FC Grounds, Colombo"
              value={challengeVenue}
              onChangeText={setChallengeVenue}
            />

            <Text style={s.inputLabel}>PROPOSED DATE & TIME</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Next Saturday, 4:00 PM"
              value={challengeDate}
              onChangeText={setChallengeDate}
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setChallengeModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSubmit} onPress={handleCreateChallenge}>
                <Text style={s.modalSubmitText}>Send Challenge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
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
  headerKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#059669',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  createBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  subTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  subTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  subTabTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    paddingBottom: 30,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sportBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sportBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  cityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cityBadgeText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
  },
  teamName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  teamBio: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaBold: {
    fontWeight: '600',
    color: '#374151',
  },
  metaDot: {
    marginHorizontal: 8,
    color: '#9CA3AF',
  },
  teamCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  actionBtnPrimary: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  banner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeSport: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  statusChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusChipAccepted: {
    backgroundColor: '#D1FAE5',
  },
  statusChipDeclined: {
    backgroundColor: '#FEE2E2',
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  statusChipTextAccepted: {
    color: '#065F46',
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
  },
  matchupTeam: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  matchupVs: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    paddingHorizontal: 8,
  },
  matchupDetails: {
    gap: 4,
    marginBottom: 12,
  },
  detailItem: {
    fontSize: 12,
    color: '#4B5563',
  },
  challengeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  declineBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  declineBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  closeText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '700',
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputMulti: {
    height: 70,
    textAlignVertical: 'top',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#059669',
  },
  chipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  modalCancel: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  modalCancelText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 13,
  },
  modalSubmit: {
    backgroundColor: '#059669',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rosterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  addPlayerBtn: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addPlayerBtnText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  memberAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  memberRole: {
    fontSize: 11,
    color: '#6B7280',
  },
  removeMemberBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeMemberText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

