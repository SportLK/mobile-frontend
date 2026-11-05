import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { tournamentService } from '../../services/tournamentService';
import { Tournament, OrganizerWorkspaceStats } from '../../types/tournament.types';
import { COLORS } from '../../constants/colors';

interface Props {
  onCreateTournament?: () => void;
  onSelectTournament?: (tournament: Tournament) => void;
  onManageBrackets?: (tournament: Tournament) => void;
  onManageRegistrations?: (tournament: Tournament) => void;
  onSwitchWorkspace?: () => void;
}

type FilterTab = 'ALL' | 'OPEN' | 'ONGOING' | 'COMPLETED';

export default function OrganizerWorkspaceScreen({
  onCreateTournament,
  onSelectTournament,
  onManageBrackets,
  onManageRegistrations,
  onSwitchWorkspace,
}: Props) {
  const { accessToken, userName } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState<OrganizerWorkspaceStats>({
    totalTournaments: 0,
    ongoingTournaments: 0,
    openTournaments: 0,
    completedTournaments: 0,
    totalRegistrations: 0,
  });

  const loadWorkspaceData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const data = await tournamentService.getOrganizerWorkspace(accessToken);
      setStats(data.stats);
      setTournaments(data.tournaments);
    } catch {
      // Fallback: fetch general tournaments if workspace endpoint has no items yet
      try {
        const list = await tournamentService.getTournaments();
        setTournaments(list);
        setStats({
          totalTournaments: list.length,
          ongoingTournaments: list.filter((t) => t.tournamentStatus === 'ONGOING').length,
          openTournaments: list.filter((t) => t.tournamentStatus === 'OPEN_FOR_REGISTRATION').length,
          completedTournaments: list.filter((t) => t.tournamentStatus === 'COMPLETED').length,
          totalRegistrations: list.reduce((acc, t) => acc + (t.registrations?.length || 0), 0),
        });
      } catch {
        // Keep empty state
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkspaceData();
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      await tournamentService.seedDemoData();
      Alert.alert('Demo Seeded! 🏆', 'Sample tournaments and team registrations have been loaded.');
      await loadWorkspaceData();
    } catch (err: any) {
      Alert.alert('Seed Notice', err?.message || 'Could not seed data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (filter === 'OPEN') return t.tournamentStatus === 'OPEN_FOR_REGISTRATION';
    if (filter === 'ONGOING') return t.tournamentStatus === 'ONGOING';
    if (filter === 'COMPLETED') return t.tournamentStatus === 'COMPLETED';
    return true;
  });

  const getSportIcon = (sport: string) => {
    switch (sport?.toUpperCase()) {
      case 'CRICKET':
        return '🏏';
      case 'FOOTBALL':
        return '⚽';
      case 'BADMINTON':
        return '🏸';
      case 'BASKETBALL':
        return '🏀';
      case 'VOLLEYBALL':
        return '🏐';
      default:
        return '🏆';
    }
  };

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

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 1. Organizer Identity Header ─────────────────────────────────── */}
      <View style={s.headerCard}>
        <View style={s.headerTopRow}>
          <View style={s.organizerAvatar}>
            <Text style={s.organizerAvatarText}>
              {userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </Text>
          </View>
          <View style={s.organizerInfo}>
            <View style={s.badgeRow}>
              <View style={s.verifiedPill}>
                <Text style={s.verifiedPillText}>🎖️ ACCREDITED HOST</Text>
              </View>
            </View>
            <Text style={s.organizerName}>{userName}</Text>
            <Text style={s.organizerWorkspaceTag}>Tournament Organizer Workspace</Text>
          </View>
          {onSwitchWorkspace && (
            <Pressable style={s.switchBtn} onPress={onSwitchWorkspace}>
              <Text style={s.switchBtnText}>Switch ⌂</Text>
            </Pressable>
          )}
        </View>

        {/* Quick Seed Action for Evaluator */}
        <Pressable style={s.demoSeedBtn} onPress={handleSeedDemo}>
          <Text style={s.demoSeedText}>⚡ Load Demo Tournaments</Text>
        </Pressable>
      </View>

      {/* ── 2. KPI Metrics Grid ──────────────────────────────────────────── */}
      <Text style={s.sectionHeader}>WORKSPACE OVERVIEW</Text>
      <View style={s.metricsGrid}>
        <View style={s.metricCard}>
          <Text style={s.metricIcon}>🏆</Text>
          <Text style={s.metricValue}>{stats.totalTournaments}</Text>
          <Text style={s.metricLabel}>Total Tournaments</Text>
        </View>
        <View style={[s.metricCard, s.metricCardGreen]}>
          <Text style={s.metricIcon}>🔴</Text>
          <Text style={[s.metricValue, s.textGreen]}>{stats.ongoingTournaments}</Text>
          <Text style={s.metricLabel}>Live / Ongoing</Text>
        </View>
        <View style={s.metricCard}>
          <Text style={s.metricIcon}>📝</Text>
          <Text style={s.metricValue}>{stats.openTournaments}</Text>
          <Text style={s.metricLabel}>Open for Entry</Text>
        </View>
        <View style={s.metricCard}>
          <Text style={s.metricIcon}>👥</Text>
          <Text style={s.metricValue}>{stats.totalRegistrations}</Text>
          <Text style={s.metricLabel}>Team Entries</Text>
        </View>
      </View>

      {/* ── 3. Quick Action Hub ─────────────────────────────────────────── */}
      <View style={s.actionRow}>
        <Pressable
          style={s.actionPrimary}
          onPress={() => onCreateTournament && onCreateTournament()}
        >
          <Text style={s.actionPrimaryIcon}>＋</Text>
          <View>
            <Text style={s.actionPrimaryTitle}>Create Tournament</Text>
            <Text style={s.actionPrimarySubtitle}>Set format, dates & select venue</Text>
          </View>
        </Pressable>
      </View>

      {/* ── 4. My Tournaments Section & Tabs ─────────────────────────────── */}
      <View style={s.listHeaderRow}>
        <View>
          <Text style={s.sectionHeader}>MY TOURNAMENTS ({filteredTournaments.length})</Text>
          <Text style={s.sectionSub}>Manage brackets, match progression & teams</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={s.filterRow}>
        {(['ALL', 'OPEN', 'ONGOING', 'COMPLETED'] as FilterTab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[s.filterPill, filter === tab && s.filterPillActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[s.filterText, filter === tab && s.filterTextActive]}>
              {tab === 'ALL'
                ? 'All'
                : tab === 'OPEN'
                ? 'Open'
                : tab === 'ONGOING'
                ? 'Ongoing'
                : 'Finished'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tournaments List */}
      {loading ? (
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={s.loadingText}>Fetching organizer tournaments...</Text>
        </View>
      ) : filteredTournaments.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyIcon}>🏆</Text>
          <Text style={s.emptyTitle}>No Tournaments Found</Text>
          <Text style={s.emptySubtitle}>
            {filter === 'ALL'
              ? 'You have not created any tournaments yet. Tap "Create Tournament" or load demo data to begin.'
              : `No tournaments currently matching status "${filter}".`}
          </Text>
          <Pressable
            style={s.emptyButton}
            onPress={() => onCreateTournament && onCreateTournament()}
          >
            <Text style={s.emptyButtonText}>＋ Create Your First Tournament</Text>
          </Pressable>
        </View>
      ) : (
        filteredTournaments.map((tournament) => {
          const badge = getStatusBadge(tournament.tournamentStatus);
          const confirmedCount =
            tournament.confirmedTeamsCount ??
            tournament.registrations?.filter((r) => r.registrationStatus === 'CONFIRMED').length ??
            0;
          const maxTeams = tournament.maxParticipatingTeams || 16;
          const fillRatio = Math.min(1, confirmedCount / maxTeams);

          return (
            <View key={tournament.id} style={s.tournamentCard}>
              {/* Card Header */}
              <View style={s.cardTopRow}>
                <View style={s.sportTag}>
                  <Text style={s.sportTagIcon}>{getSportIcon(tournament.sportType)}</Text>
                  <Text style={s.sportTagText}>{tournament.sportType}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[s.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
                </View>
              </View>

              {/* Tournament Title */}
              <Text style={s.tournamentTitle}>{tournament.tournamentName}</Text>

              {/* Details & Metadata */}
              <View style={s.metaGrid}>
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>FORMAT</Text>
                  <Text style={s.metaValue}>
                    {tournament.tournamentFormat === 'ROUND_ROBIN'
                      ? 'Round Robin'
                      : 'Knockout (Single)'}
                  </Text>
                </View>
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>VENUE / CITY</Text>
                  <Text style={s.metaValue}>
                    {tournament.venue?.venueName || tournament.city || 'Colombo Complex'}
                  </Text>
                </View>
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>DATES</Text>
                  <Text style={s.metaValue}>
                    {tournament.startDate} to {tournament.endDate}
                  </Text>
                </View>
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>PRIZE POOL</Text>
                  <Text style={[s.metaValue, s.textGreen]}>
                    {tournament.prizePool || 'Trophy & Medals'}
                  </Text>
                </View>
              </View>

              {/* Team Capacity Bar */}
              <View style={s.capacitySection}>
                <View style={s.capacityTextRow}>
                  <Text style={s.capacityLabel}>Confirmed Teams</Text>
                  <Text style={s.capacityValue}>
                    {confirmedCount} / {maxTeams} Teams
                  </Text>
                </View>
                <View style={s.progressBarBg}>
                  <View style={[s.progressBarFill, { width: `${fillRatio * 100}%` }]} />
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={s.cardActionsRow}>
                <Pressable
                  style={s.cardActionBtn}
                  onPress={() => onManageRegistrations && onManageRegistrations(tournament)}
                >
                  <Text style={s.cardActionBtnText}>👥 Teams ({confirmedCount})</Text>
                </Pressable>

                <Pressable
                  style={[s.cardActionBtn, s.cardActionBtnHighlight]}
                  onPress={() => onManageBrackets && onManageBrackets(tournament)}
                >
                  <Text style={s.cardActionBtnTextHighlight}>🌳 Bracket Tree</Text>
                </Pressable>

                <Pressable
                  style={s.cardActionBtn}
                  onPress={() => onSelectTournament && onSelectTournament(tournament)}
                >
                  <Text style={s.cardActionBtnText}>Details →</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  organizerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  organizerInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  verifiedPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedPillText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  organizerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  organizerWorkspaceTag: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  switchBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  switchBtnText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  demoSeedBtn: {
    marginTop: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoSeedText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: -6,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricCardGreen: {
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDF4',
  },
  metricIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  textGreen: {
    color: '#059669',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    marginBottom: 22,
  },
  actionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  actionPrimaryIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '800',
    marginRight: 14,
  },
  actionPrimaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  actionPrimarySubtitle: {
    color: '#D1FAE5',
    fontSize: 12,
    marginTop: 2,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#111827',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  centerBox: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tournamentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportTagIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  sportTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tournamentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metaItem: {
    width: '47%',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  capacitySection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  capacityTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  capacityLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  capacityValue: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  cardActionBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionBtnHighlight: {
    backgroundColor: '#D1FAE5',
  },
  cardActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  cardActionBtnTextHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
});

