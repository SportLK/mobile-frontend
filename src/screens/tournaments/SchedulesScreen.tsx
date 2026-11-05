import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { tournamentService } from '../../services/tournamentService';
import { Match, MatchStatus } from '../../types/match.types';
import { Tournament } from '../../types/tournament.types';

interface Props {
  tournament: Tournament;
  onBack: () => void;
  onNavigateToBrackets?: () => void;
}

type FilterStatus = 'ALL' | 'LIVE' | 'SCHEDULED' | 'COMPLETED';

export default function SchedulesScreen({
  tournament,
  onBack,
  onNavigateToBrackets,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  const loadSchedules = useCallback(async () => {
    try {
      const data = await tournamentService.getTournamentSchedules(tournament.id);
      setMatches(data || []);
    } catch {
      // Fallback: check tournament.matches or keep empty
      setMatches(tournament.matches || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tournament.id, tournament.matches]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedules();
  };

  const filteredMatches = matches.filter((m) => {
    if (filter === 'LIVE') return m.matchStatus === 'LIVE';
    if (filter === 'SCHEDULED') return m.matchStatus === 'SCHEDULED';
    if (filter === 'COMPLETED') return m.matchStatus === 'COMPLETED';
    return true;
  });

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case 'LIVE':
        return { label: 'LIVE 🔴', bg: '#FEE2E2', text: '#DC2626' };
      case 'COMPLETED':
        return { label: 'FINISHED ✓', bg: '#D1FAE5', text: '#065F46' };
      case 'SCHEDULED':
        return { label: 'SCHEDULED', bg: '#E0E7FF', text: '#3730A3' };
      case 'POSTPONED':
        return { label: 'POSTPONED', bg: '#FEF3C7', text: '#92400E' };
      case 'ABANDONED':
        return { label: 'ABANDONED', bg: '#F3F4F6', text: '#4B5563' };
      default:
        return { label: status, bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.substring(0, 10);
      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${datePart} • ${timePart}`;
    } catch {
      return dateStr.substring(0, 10);
    }
  };

  const liveCount = matches.filter((m) => m.matchStatus === 'LIVE').length;
  const completedCount = matches.filter((m) => m.matchStatus === 'COMPLETED').length;

  return (
    <View style={s.container}>
      {/* ── Top Header ────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <Pressable style={s.backBtn} onPress={onBack}>
          <Text style={s.backBtnText}>← Back</Text>
        </Pressable>
        <View style={s.topBarTitleWrap}>
          <Text style={s.topBarTitle}>Fixtures & Schedules</Text>
          <Text style={s.topBarSubtitle}>{tournament.tournamentName}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Info Banner ────────────────────────────────────── */}
        <View style={s.heroBanner}>
          <View style={s.heroTop}>
            <View style={s.sportTag}>
              <Text style={s.sportTagText}>{tournament.sportType} MATCHES</Text>
            </View>
            {liveCount > 0 && (
              <View style={s.livePill}>
                <Text style={s.livePillText}>{liveCount} MATCH LIVE NOW 🔴</Text>
              </View>
            )}
          </View>
          <Text style={s.heroTitle}>Tournament Match Fixtures</Text>
          <Text style={s.heroDesc}>
            Chronological calendar of all sanctioned tournament matches, venues, real-time score updates,
            and match results.
          </Text>

          <View style={s.statsStrip}>
            <View style={s.statBox}>
              <Text style={s.statVal}>{matches.length}</Text>
              <Text style={s.statLbl}>Total Fixtures</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statVal, s.textRed]}>{liveCount}</Text>
              <Text style={s.statLbl}>In Play</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statVal, s.textGreen]}>{completedCount}</Text>
              <Text style={s.statLbl}>Finished</Text>
            </View>
          </View>
        </View>

        {/* ── Filter Tabs ─────────────────────────────────────────── */}
        <View style={s.filterRow}>
          {(['ALL', 'LIVE', 'SCHEDULED', 'COMPLETED'] as FilterStatus[]).map((st) => (
            <Pressable
              key={st}
              style={[s.filterPill, filter === st && s.filterPillActive]}
              onPress={() => setFilter(st)}
            >
              <Text style={[s.filterText, filter === st && s.filterTextActive]}>
                {st === 'ALL'
                  ? 'All'
                  : st === 'LIVE'
                  ? `Live (${liveCount})`
                  : st === 'SCHEDULED'
                  ? 'Scheduled'
                  : 'Finished'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Match List ──────────────────────────────────────────── */}
        {loading ? (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={s.mutedText}>Fetching tournament fixtures...</Text>
          </View>
        ) : filteredMatches.length === 0 ? (
          /* Empty State */
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>📅</Text>
            <Text style={s.emptyTitle}>No Fixtures Found</Text>
            <Text style={s.emptySubtitle}>
              {matches.length === 0
                ? 'Matches have not been generated yet. Seed participating teams through the knockout bracket tree to create the official tournament schedule.'
                : `No fixtures currently match the "${filter}" filter.`}
            </Text>
            {matches.length === 0 && onNavigateToBrackets && (
              <Pressable style={s.actionBtn} onPress={onNavigateToBrackets}>
                <Text style={s.actionBtnText}>🏆 Open Bracket Tree to Seed Fixtures</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={s.matchList}>
            {filteredMatches.map((m, index) => {
              const badge = getStatusBadge(m.matchStatus);
              const homeScore = m.score?.homeTeamScoreDisplay || '-';
              const awayScore = m.score?.awayTeamScoreDisplay || '-';
              const isFinished = m.matchStatus === 'COMPLETED';
              const isLive = m.matchStatus === 'LIVE';

              return (
                <View key={m.id || index} style={s.fixtureCard}>
                  {/* Card Header */}
                  <View style={s.fixtureHeader}>
                    <View style={s.timeRow}>
                      <Text style={s.calendarIcon}>📅</Text>
                      <Text style={s.timeText}>
                        {formatDateTime(m.scheduledStartTime)}
                      </Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[s.statusBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Venue Sub-row */}
                  <View style={s.venueRow}>
                    <Text style={s.venuePin}>📍</Text>
                    <Text style={s.venueName}>
                      {m.venue?.venueName || tournament.venue?.venueName || tournament.city || 'Colombo Grounds'}
                    </Text>
                  </View>

                  {/* Matchup Body */}
                  <View style={s.teamsBox}>
                    {/* Home Team */}
                    <View style={s.teamLine}>
                      <View style={s.teamAvatar}>
                        <Text style={s.teamAvatarText}>
                          {m.homeTeam?.teamName?.[0] || 'H'}
                        </Text>
                      </View>
                      <Text
                        style={[
                          s.teamName,
                          m.winnerTeamId === m.homeTeamId && s.winningTeam,
                        ]}
                        numberOfLines={1}
                      >
                        {m.homeTeam?.teamName || 'Home Squad'}
                      </Text>
                      <Text style={[s.scoreText, isLive && s.scoreTextLive]}>
                        {homeScore}
                      </Text>
                    </View>

                    {/* Away Team */}
                    <View style={s.teamLine}>
                      <View style={s.teamAvatar}>
                        <Text style={s.teamAvatarText}>
                          {m.awayTeam?.teamName?.[0] || 'A'}
                        </Text>
                      </View>
                      <Text
                        style={[
                          s.teamName,
                          m.winnerTeamId === m.awayTeamId && s.winningTeam,
                        ]}
                        numberOfLines={1}
                      >
                        {m.awayTeam?.teamName || 'Away Squad'}
                      </Text>
                      <Text style={[s.scoreText, isLive && s.scoreTextLive]}>
                        {awayScore}
                      </Text>
                    </View>
                  </View>

                  {/* Match Footer */}
                  {isFinished && m.winnerTeamId && (
                    <View style={s.winnerBanner}>
                      <Text style={s.winnerBannerText}>
                        🏆 Winner:{' '}
                        {m.winnerTeamId === m.homeTeamId
                          ? m.homeTeam?.teamName
                          : m.awayTeam?.teamName}
                      </Text>
                    </View>
                  )}

                  {isLive && (
                    <View style={s.liveNotice}>
                      <Text style={s.liveNoticeText}>
                        🔴 Live scoring in progress • Official match in play
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  heroBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sportTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sportTagText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  livePill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  livePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLbl: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  textRed: {
    color: '#F87171',
  },
  textGreen: {
    color: '#34D399',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  centerBox: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  mutedText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
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
    marginBottom: 14,
  },
  actionBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  matchList: {
    gap: 12,
  },
  fixtureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  fixtureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarIcon: {
    fontSize: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  venuePin: {
    fontSize: 11,
  },
  venueName: {
    fontSize: 11,
    color: '#6B7280',
  },
  teamsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  teamLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  winningTeam: {
    color: '#065F46',
    fontWeight: '800',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    paddingHorizontal: 8,
  },
  scoreTextLive: {
    color: '#DC2626',
  },
  winnerBanner: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  winnerBannerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  liveNotice: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    alignItems: 'center',
  },
  liveNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
});

