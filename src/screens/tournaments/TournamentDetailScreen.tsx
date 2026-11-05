import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { tournamentService } from '../../services/tournamentService';
import {
  RegistrationStatus,
  Tournament,
  TournamentRegistration,
} from '../../types/tournament.types';

interface Props {
  tournament: Tournament;
  onBack: () => void;
  onOpenBrackets?: (tournament: Tournament) => void;
  onOpenSchedules?: (tournament: Tournament) => void;
  onTournamentUpdated?: () => void;
}

type DetailTab = 'OVERVIEW' | 'TEAMS' | 'RULES';

export default function TournamentDetailScreen({
  tournament: initialTournament,
  onBack,
  onOpenBrackets,
  onOpenSchedules,
  onTournamentUpdated,
}: Props) {
  const { accessToken, roles, workspace } = useAuth();

  const [activeTab, setActiveTab] = useState<DetailTab>('OVERVIEW');
  const [tournament, setTournament] = useState<Tournament>(initialTournament);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(
    initialTournament.registrations || [],
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingRegId, setUpdatingRegId] = useState<string | null>(null);

  // Team Registration Modal (for Team Managers)
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [teamIdInput, setTeamIdInput] = useState('');
  const [registering, setRegistering] = useState(false);

  const isOrganizer = workspace === 'organizer' || roles.includes('organizer');

  // Load fresh details and registrations
  const loadData = useCallback(async () => {
    try {
      const [freshTournament, freshRegistrations] = await Promise.all([
        tournamentService.getTournamentDetails(tournament.id).catch(() => null),
        tournamentService.getTournamentRegistrations(tournament.id).catch(() => null),
      ]);

      if (freshTournament) {
        setTournament(freshTournament);
      }
      if (freshRegistrations) {
        setRegistrations(freshRegistrations);
      }
    } catch {
      // Keep existing data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tournament.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN_FOR_REGISTRATION':
        return { label: 'OPEN FOR ENTRY', bg: '#D1FAE5', text: '#065F46' };
      case 'ONGOING':
        return { label: 'ONGOING 🔴', bg: '#FEE2E2', text: '#991B1B' };
      case 'COMPLETED':
        return { label: 'COMPLETED 🏆', bg: '#E0E7FF', text: '#3730A3' };
      case 'REGISTRATION_CLOSED':
        return { label: 'REGISTRATION CLOSED', bg: '#FEF3C7', text: '#92400E' };
      default:
        return { label: status, bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const getRegStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'CONFIRMED', bg: '#D1FAE5', text: '#065F46', icon: '✓' };
      case 'PAYMENT_PENDING':
        return { label: 'PENDING', bg: '#FEF3C7', text: '#92400E', icon: '⏳' };
      case 'DISQUALIFIED':
        return { label: 'DISQUALIFIED', bg: '#FEE2E2', text: '#991B1B', icon: '✕' };
      default:
        return { label: status, bg: '#F3F4F6', text: '#4B5563', icon: '•' };
    }
  };

  // Handle organizer approving/changing registration status
  const handleUpdateRegStatus = async (regId: string, newStatus: RegistrationStatus) => {
    if (!accessToken) {
      Alert.alert('Notice', 'Please authenticate to manage registrations.');
      return;
    }
    try {
      setUpdatingRegId(regId);
      await tournamentService.updateRegistrationStatus(
        accessToken,
        tournament.id,
        regId,
        newStatus,
      );
      Alert.alert('Success', `Registration updated to ${newStatus}.`);
      await loadData();
      if (onTournamentUpdated) onTournamentUpdated();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update registration.');
    } finally {
      setUpdatingRegId(null);
    }
  };

  // Handle Team Manager registering a team
  const handleRegisterTeam = async () => {
    const trimmedTeamId = teamIdInput.trim();
    if (!trimmedTeamId) {
      Alert.alert('Team Required', 'Please enter your Team ID or select a team.');
      return;
    }
    if (!accessToken) {
      Alert.alert('Authentication', 'Please sign in to register your squad.');
      return;
    }
    try {
      setRegistering(true);
      await tournamentService.registerTeam(accessToken, tournament.id, trimmedTeamId);
      Alert.alert(
        'Registration Submitted! 🎉',
        'Your team registration is now pending confirmation by the tournament organizer.',
      );
      setRegisterModalOpen(false);
      setTeamIdInput('');
      await loadData();
      if (onTournamentUpdated) onTournamentUpdated();
    } catch (err: any) {
      Alert.alert('Registration Error', err?.message || 'Could not register team.');
    } finally {
      setRegistering(false);
    }
  };

  const statusBadge = getStatusBadge(tournament.tournamentStatus);
  const confirmedTeams = registrations.filter((r) => r.registrationStatus === 'CONFIRMED');

  return (
    <View style={s.container}>
      {/* ── Top Header ────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <Pressable style={s.backBtn} onPress={onBack}>
          <Text style={s.backBtnText}>← Back</Text>
        </Pressable>
        <View style={s.topBarTitleWrap}>
          <Text style={s.topBarTitle} numberOfLines={1}>
            {tournament.tournamentName}
          </Text>
          <Text style={s.topBarSubtitle}>Step 4 • Tournament Hub</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <View style={s.heroCard}>
          <View style={s.heroTopRow}>
            <View style={[s.statusPill, { backgroundColor: statusBadge.bg }]}>
              <Text style={[s.statusPillText, { color: statusBadge.text }]}>
                {statusBadge.label}
              </Text>
            </View>
            <View style={s.sportPill}>
              <Text style={s.sportPillText}>{tournament.sportType}</Text>
            </View>
          </View>

          <Text style={s.tournamentTitle}>{tournament.tournamentName}</Text>
          <Text style={s.formatText}>
            {tournament.tournamentFormat.replace('_', ' ')} • {tournament.city || 'Sri Lanka'}
          </Text>

          {/* Key Metrics Strip */}
          <View style={s.metricStrip}>
            <View style={s.metricItem}>
              <Text style={s.metricIcon}>📅</Text>
              <Text style={s.metricVal}>
                {tournament.startDate ? tournament.startDate.substring(0, 10) : 'TBD'}
              </Text>
              <Text style={s.metricLbl}>Start Date</Text>
            </View>
            <View style={s.metricItem}>
              <Text style={s.metricIcon}>👥</Text>
              <Text style={s.metricVal}>
                {registrations.length} / {tournament.maxParticipatingTeams}
              </Text>
              <Text style={s.metricLbl}>Teams Registered</Text>
            </View>
            <View style={s.metricItem}>
              <Text style={s.metricIcon}>💰</Text>
              <Text style={s.metricVal}>
                {tournament.prizePool || `LKR ${(tournament.registrationFee || 0).toLocaleString()}`}
              </Text>
              <Text style={s.metricLbl}>Prize Pool / Fee</Text>
            </View>
          </View>
        </View>

        {/* ── Quick Action Buttons (Bracket & Schedules) ──────────── */}
        <View style={s.actionRow}>
          {onOpenBrackets && (
            <Pressable
              style={s.bracketActionBtn}
              onPress={() => onOpenBrackets(tournament)}
            >
              <Text style={s.actionBtnIcon}>🏆</Text>
              <View>
                <Text style={s.actionBtnTitle}>Bracket Tree</Text>
                <Text style={s.actionBtnSub}>Knockouts & Progression</Text>
              </View>
            </Pressable>
          )}

          {onOpenSchedules && (
            <Pressable
              style={s.scheduleActionBtn}
              onPress={() => onOpenSchedules(tournament)}
            >
              <Text style={s.actionBtnIcon}>📅</Text>
              <View>
                <Text style={s.actionBtnTitle}>Fixtures</Text>
                <Text style={s.actionBtnSub}>Match Schedules</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* ── Tab Switcher ────────────────────────────────────────── */}
        <View style={s.tabBar}>
          {(['OVERVIEW', 'TEAMS', 'RULES'] as DetailTab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[s.tabButton, activeTab === tab && s.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                {tab === 'OVERVIEW'
                  ? 'Overview'
                  : tab === 'TEAMS'
                  ? `Teams (${registrations.length})`
                  : 'Rules & Venue'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── TAB 1: OVERVIEW ─────────────────────────────────────── */}
        {activeTab === 'OVERVIEW' && (
          <View style={s.tabContent}>
            {/* Description Card */}
            <View style={s.card}>
              <Text style={s.cardHeader}>TOURNAMENT OVERVIEW</Text>
              <Text style={s.cardBody}>
                {tournament.description ||
                  'Official SportLK sanctioned competition. Full match schedules, team rosters, and real-time live scoring are hosted on the platform.'}
              </Text>
            </View>

            {/* Capacity Meter */}
            <View style={s.card}>
              <View style={s.cardHeaderRow}>
                <Text style={s.cardHeader}>REGISTRATION CAPACITY</Text>
                <Text style={s.capacityCount}>
                  {registrations.length} / {tournament.maxParticipatingTeams} Teams
                </Text>
              </View>
              <View style={s.progressBarTrack}>
                <View
                  style={[
                    s.progressBarFill,
                    {
                      width: `${Math.min(
                        100,
                        (registrations.length / (tournament.maxParticipatingTeams || 8)) * 100,
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={s.capacitySub}>
                Minimum required for knockout seeding: {tournament.minParticipatingTeams} teams •{' '}
                {confirmedTeams.length} confirmed
              </Text>

              {/* Team Manager Registration Action */}
              {tournament.tournamentStatus === 'OPEN_FOR_REGISTRATION' && (
                <Pressable
                  style={s.registerTeamCta}
                  onPress={() => setRegisterModalOpen(true)}
                >
                  <Text style={s.registerTeamCtaText}>+ Register a Team Squad</Text>
                </Pressable>
              )}
            </View>

            {/* Organizer Profile Card */}
            <View style={s.card}>
              <Text style={s.cardHeader}>ORGANIZER ACCREDITATION</Text>
              <View style={s.organizerRow}>
                <View style={s.organizerAvatar}>
                  <Text style={s.organizerAvatarText}>
                    {tournament.organizer?.displayName?.[0] || 'O'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.organizerName}>
                    {tournament.organizer?.displayName ||
                      tournament.organizer?.fullName ||
                      'Accredited Organizer'}
                  </Text>
                  <Text style={s.organizerEmail}>{tournament.organizer?.email || 'Verified Host'}</Text>
                </View>
                <View style={s.accreditedBadge}>
                  <Text style={s.accreditedBadgeText}>VERIFIED</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── TAB 2: TEAMS & REGISTRATIONS ───────────────────────── */}
        {activeTab === 'TEAMS' && (
          <View style={s.tabContent}>
            <View style={s.listHeaderRow}>
              <View>
                <Text style={s.cardHeader}>REGISTERED TEAMS ({registrations.length})</Text>
                <Text style={s.listHeaderSub}>
                  {isOrganizer
                    ? 'Review team rosters and manage official participation status'
                    : 'List of participating clubs and squads'}
                </Text>
              </View>
              {tournament.tournamentStatus === 'OPEN_FOR_REGISTRATION' && (
                <Pressable
                  style={s.addTeamSmallBtn}
                  onPress={() => setRegisterModalOpen(true)}
                >
                  <Text style={s.addTeamSmallBtnText}>+ Register</Text>
                </Pressable>
              )}
            </View>

            {registrations.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={s.emptyIcon}>👥</Text>
                <Text style={s.emptyTitle}>No Teams Registered Yet</Text>
                <Text style={s.emptySubtitle}>
                  Team managers can register their squads while registration remains open.
                </Text>
                <Pressable
                  style={s.emptyActionBtn}
                  onPress={() => setRegisterModalOpen(true)}
                >
                  <Text style={s.emptyActionText}>Register First Team</Text>
                </Pressable>
              </View>
            ) : (
              registrations.map((reg, index) => {
                const regBadge = getRegStatusBadge(reg.registrationStatus);
                const isUpdating = updatingRegId === reg.id;
                return (
                  <View key={reg.id || index} style={s.teamCard}>
                    <View style={s.teamCardTop}>
                      <View style={s.teamAvatar}>
                        <Text style={s.teamAvatarText}>
                          {reg.team?.teamName?.[0] || 'T'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.teamName}>
                          {reg.team?.teamName || `Team #${index + 1}`}
                        </Text>
                        <Text style={s.teamSub}>
                          {reg.team?.city || tournament.city || 'Sri Lanka'} • Registered{' '}
                          {reg.registeredAt ? reg.registeredAt.substring(0, 10) : 'recently'}
                        </Text>
                      </View>
                      <View style={[s.regStatusPill, { backgroundColor: regBadge.bg }]}>
                        <Text style={[s.regStatusText, { color: regBadge.text }]}>
                          {regBadge.icon} {regBadge.label}
                        </Text>
                      </View>
                    </View>

                    {/* Organizer Status Change Actions */}
                    {isOrganizer && (
                      <View style={s.regActionsRow}>
                        <Text style={s.actionsLabel}>ORGANIZER ACTION:</Text>
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#10B981" />
                        ) : (
                          <View style={s.statusActionChips}>
                            {reg.registrationStatus !== 'CONFIRMED' && (
                              <Pressable
                                style={s.confirmChip}
                                onPress={() => handleUpdateRegStatus(reg.id, 'CONFIRMED')}
                              >
                                <Text style={s.confirmChipText}>✓ Confirm</Text>
                              </Pressable>
                            )}
                            {reg.registrationStatus !== 'PAYMENT_PENDING' && (
                              <Pressable
                                style={s.pendingChip}
                                onPress={() => handleUpdateRegStatus(reg.id, 'PAYMENT_PENDING')}
                              >
                                <Text style={s.pendingChipText}>⏳ Pending</Text>
                              </Pressable>
                            )}
                            {reg.registrationStatus !== 'DISQUALIFIED' && (
                              <Pressable
                                style={s.disqualifyChip}
                                onPress={() => handleUpdateRegStatus(reg.id, 'DISQUALIFIED')}
                              >
                                <Text style={s.disqualifyChipText}>✕ Disqualify</Text>
                              </Pressable>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── TAB 3: RULES & VENUE ───────────────────────────────── */}
        {activeTab === 'RULES' && (
          <View style={s.tabContent}>
            {/* Venue Card */}
            <View style={s.card}>
              <Text style={s.cardHeader}>VENUE & MATCH GROUND</Text>
              <View style={s.venueRow}>
                <Text style={s.venueIcon}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.venueTitle}>
                    {tournament.venue?.venueName || 'Colombo Futsal Arena'}
                  </Text>
                  <Text style={s.venueDesc}>
                    {tournament.venue?.addressLine ||
                      `${tournament.city || 'Colombo'}, Western Province, Sri Lanka`}
                  </Text>
                  <Text style={s.venueRate}>
                    Base Facility Rate: LKR{' '}
                    {tournament.venue?.hourlyBaseRate?.toLocaleString() || '5,000'}/hour
                  </Text>
                </View>
              </View>
            </View>

            {/* Rules Card */}
            <View style={s.card}>
              <Text style={s.cardHeader}>OFFICIAL TOURNAMENT RULES</Text>
              <Text style={s.cardBody}>
                {tournament.rules ||
                  '1. All teams must check in 30 minutes prior to scheduled match time.\n2. Standard governing body rules apply for all matches.\n3. Single elimination knockout rules: Tied games proceed directly to penalty shootouts.\n4. Disqualified teams forfeit their matches with a 3-0 scoreline.\n5. Referees and official decisions are final.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Modal: Register Team (For Team Managers) ─────────────── */}
      <Modal
        visible={registerModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRegisterModalOpen(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Register Team Squad</Text>
              <Pressable onPress={() => setRegisterModalOpen(false)}>
                <Text style={s.modalClose}>✕</Text>
              </Pressable>
            </View>
            <Text style={s.modalSubtitle}>
              Enter your SportLK Team ID or Name to register for "{tournament.tournamentName}".
            </Text>

            <Text style={s.modalLabel}>TEAM ID / SQUAD NAME *</Text>
            <TextInput
              style={s.modalInput}
              placeholder="e.g. colombo-strikers-fc"
              placeholderTextColor="#9CA3AF"
              value={teamIdInput}
              onChangeText={setTeamIdInput}
            />

            <View style={s.modalFeeRow}>
              <Text style={s.modalFeeLabel}>Registration Entry Fee:</Text>
              <Text style={s.modalFeeValue}>
                LKR {(tournament.registrationFee || 0).toLocaleString()}
              </Text>
            </View>

            <Pressable
              style={[s.modalSubmitBtn, registering && s.btnDisabled]}
              onPress={handleRegisterTeam}
              disabled={registering}
            >
              {registering ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={s.modalSubmitText}>Confirm Registration 🚀</Text>
              )}
            </Pressable>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  topBarTitleWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  topBarSubtitle: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sportPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sportPillText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  tournamentTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  formatText: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 14,
  },
  metricStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  metricLbl: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  bracketActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 12,
  },
  scheduleActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
  },
  actionBtnIcon: {
    fontSize: 22,
  },
  actionBtnTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  actionBtnSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  tabContent: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  capacityCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  cardBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  capacitySub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
  },
  registerTeamCta: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  registerTeamCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  organizerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  organizerEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  accreditedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  accreditedBadgeText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '800',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listHeaderSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  addTeamSmallBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addTeamSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  teamCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAvatarText: {
    fontWeight: '800',
    color: '#111827',
    fontSize: 14,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  teamSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  regStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  regStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  regActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  statusActionChips: {
    flexDirection: 'row',
    gap: 6,
  },
  confirmChip: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confirmChipText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  pendingChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingChipText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  disqualifyChip: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  disqualifyChipText: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '700',
  },
  venueRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 4,
  },
  venueIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  venueTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  venueDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  venueRate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalClose: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
    lineHeight: 18,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
  },
  modalFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 14,
  },
  modalFeeLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalFeeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  modalSubmitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

