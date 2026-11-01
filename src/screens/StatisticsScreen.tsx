import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '../theme/colors';
import {
  PlatformOverviewStats,
  SportBreakdownItem,
  TopVenueItem,
  TeamLeaderboardItem,
  PlayerLeaderboardItem,
} from '../types/statistics.types';
import { statisticsService } from '../services/statisticsService';

type StatsTab = 'venues' | 'sports' | 'teams' | 'players';

const SAMPLE_OVERVIEW: PlatformOverviewStats = {
  matches: {
    total: 148,
    byStatus: {
      SCHEDULED: 28,
      LIVE: 4,
      COMPLETED: 116,
    },
  },
  venues: {
    total: 32,
    active: 28,
  },
  teams: {
    activeTotal: 46,
  },
  tournaments: {
    total: 12,
  },
};

const SAMPLE_TOP_VENUES: TopVenueItem[] = [
  { id: '1', venueName: 'Colombo Racecourse Grounds', city: 'Colombo 07', district: 'Colombo', matchesHosted: 42 },
  { id: '2', venueName: 'CR & FC Indoor Sports Arena', city: 'Colombo 07', district: 'Colombo', matchesHosted: 36 },
  { id: '3', venueName: 'Tyronne Fernando Stadium', city: 'Moratuwa', district: 'Colombo', matchesHosted: 24 },
  { id: '4', venueName: 'Otters Athletic Club Badminton Arena', city: 'Colombo 07', district: 'Colombo', matchesHosted: 19 },
  { id: '5', venueName: 'De Soysa Stadium Grounds', city: 'Moratuwa', district: 'Colombo', matchesHosted: 15 },
];

const SAMPLE_SPORTS_BREAKDOWN: SportBreakdownItem[] = [
  { sportType: 'CRICKET', totalMatches: 68, completedMatches: 54, liveMatches: 2 },
  { sportType: 'FUTSAL', totalMatches: 44, completedMatches: 36, liveMatches: 2 },
  { sportType: 'BADMINTON', totalMatches: 24, completedMatches: 18, liveMatches: 0 },
  { sportType: 'BASKETBALL', totalMatches: 12, completedMatches: 8, liveMatches: 0 },
];

const SAMPLE_TEAMS: TeamLeaderboardItem[] = [
  { id: '1', teamName: 'Colombo Lions CC', shortName: 'COL', sportType: 'CRICKET', matchesPlayed: 14, wins: 12, losses: 2, winRate: 85.7, form: ['W', 'W', 'W', 'L', 'W'] },
  { id: '2', teamName: 'CR&FC Strikers', shortName: 'CRFC', sportType: 'FUTSAL', matchesPlayed: 12, wins: 10, losses: 2, winRate: 83.3, form: ['W', 'W', 'W', 'W', 'L'] },
  { id: '3', teamName: 'Moratuwa Smashers', shortName: 'MOR', sportType: 'BADMINTON', matchesPlayed: 10, wins: 8, losses: 2, winRate: 80.0, form: ['W', 'L', 'W', 'W', 'W'] },
  { id: '4', teamName: 'Kandy Kings CC', shortName: 'KAN', sportType: 'CRICKET', matchesPlayed: 15, wins: 11, losses: 4, winRate: 73.3, form: ['W', 'L', 'W', 'W', 'L'] },
  { id: '5', teamName: 'Java Lane FC', shortName: 'JLFC', sportType: 'FUTSAL', matchesPlayed: 11, wins: 7, losses: 4, winRate: 63.6, form: ['L', 'W', 'L', 'W', 'W'] },
];

const SAMPLE_PLAYERS: PlayerLeaderboardItem[] = [
  { id: '1', playerName: 'Kusal Mendis', teamName: 'Colombo Lions CC', sport: 'CRICKET', category: 'Top Run Scorer', primaryStat: '482 Runs', secondaryStat: 'Avg 60.25 • SR 158.4' },
  { id: '2', playerName: 'Mohamed Aaqil', teamName: 'CR&FC Strikers', sport: 'FUTSAL', category: 'Golden Boot', primaryStat: '18 Goals', secondaryStat: '9 Matches • 2.0 G/M' },
  { id: '3', playerName: 'Wanindu Hasaranga', teamName: 'Kandy Kings CC', sport: 'CRICKET', category: 'Leading Wicket-Taker', primaryStat: '22 Wickets', secondaryStat: 'Econ 6.12 • 4/18 Best' },
  { id: '4', playerName: 'Dinuka Karunaratne', teamName: 'Moratuwa Smashers', sport: 'BADMINTON', category: 'Most Matches Won', primaryStat: '14 Wins', secondaryStat: 'Singles & Doubles' },
];

export const StatisticsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatsTab>('venues');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [overview, setOverview] = useState<PlatformOverviewStats>(SAMPLE_OVERVIEW);
  const [topVenues, setTopVenues] = useState<TopVenueItem[]>(SAMPLE_TOP_VENUES);
  const [sportsBreakdown, setSportsBreakdown] = useState<SportBreakdownItem[]>(SAMPLE_SPORTS_BREAKDOWN);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [ovData, matchData, venueData] = await Promise.allSettled([
        statisticsService.getOverview(),
        statisticsService.getMatchStatistics(),
        statisticsService.getVenueStatistics(),
      ]);

      if (ovData.status === 'fulfilled' && ovData.value) {
        setOverview(ovData.value);
      }
      if (matchData.status === 'fulfilled' && matchData.value?.sportsBreakdown) {
        setSportsBreakdown(matchData.value.sportsBreakdown);
      }
      if (venueData.status === 'fulfilled' && venueData.value?.topVenues) {
        setTopVenues(venueData.value.topVenues);
      }
    } catch (err) {
      console.warn('Failed to fetch statistics, using fallback:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Insights & Statistics</Text>
        <Text style={styles.subtitle}>
          Grassroots grounds, sport metrics & leaderboards
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* KPI CARDS GRID */}
        <View style={styles.kpiGrid}>
          {/* Card 1 */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: Colors.primaryLight }]}>
              <Text style={styles.kpiIcon}>🏟️</Text>
            </View>
            <Text style={styles.kpiValue}>{overview.venues?.active || 28}</Text>
            <Text style={styles.kpiLabel}>Active Grounds</Text>
          </View>

          {/* Card 2 */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.kpiIcon}>🏆</Text>
            </View>
            <Text style={styles.kpiValue}>{overview.matches?.total || 148}</Text>
            <Text style={styles.kpiLabel}>Total Fixtures</Text>
          </View>

          {/* Card 3 */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: Colors.liveRedLight }]}>
              <Text style={styles.kpiIcon}>🔴</Text>
            </View>
            <Text style={[styles.kpiValue, { color: Colors.liveRed }]}>
              {overview.matches?.byStatus?.LIVE || 4}
            </Text>
            <Text style={styles.kpiLabel}>Live Right Now</Text>
          </View>

          {/* Card 4 */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Text style={styles.kpiIcon}>👥</Text>
            </View>
            <Text style={styles.kpiValue}>{overview.teams?.activeTotal || 46}</Text>
            <Text style={styles.kpiLabel}>Registered Teams</Text>
          </View>
        </View>

        {/* SUB-TABS SELECTOR */}
        <View style={styles.subTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabsScroll}>
            <TouchableOpacity
              style={[styles.subTab, activeTab === 'venues' && styles.subTabActive]}
              onPress={() => setActiveTab('venues')}
            >
              <Text style={[styles.subTabText, activeTab === 'venues' && styles.subTabTextActive]}>
                🏟️ Top Grounds
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subTab, activeTab === 'sports' && styles.subTabActive]}
              onPress={() => setActiveTab('sports')}
            >
              <Text style={[styles.subTabText, activeTab === 'sports' && styles.subTabTextActive]}>
                📊 Sports Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subTab, activeTab === 'teams' && styles.subTabActive]}
              onPress={() => setActiveTab('teams')}
            >
              <Text style={[styles.subTabText, activeTab === 'teams' && styles.subTabTextActive]}>
                🎖️ Team Leaderboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subTab, activeTab === 'players' && styles.subTabActive]}
              onPress={() => setActiveTab('players')}
            >
              <Text style={[styles.subTabText, activeTab === 'players' && styles.subTabTextActive]}>
                ⭐ Top Players
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* TAB 1: TOP GROUNDS */}
        {activeTab === 'venues' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Most Utilized Grassroots Grounds</Text>
            <Text style={styles.sectionSubtitle}>Ranked by official tournament matches hosted</Text>

            {topVenues.map((v, idx) => (
              <View key={v.id || idx} style={styles.venueRankCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>#{idx + 1}</Text>
                </View>
                <View style={styles.venueRankInfo}>
                  <Text style={styles.venueRankName} numberOfLines={1}>{v.venueName}</Text>
                  <Text style={styles.venueRankCity}>📍 {v.city || 'Colombo'}</Text>
                </View>
                <View style={styles.matchesHostedBadge}>
                  <Text style={styles.matchesHostedNum}>{v.matchesHosted}</Text>
                  <Text style={styles.matchesHostedLabel}>matches</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 2: SPORTS SHARE */}
        {activeTab === 'sports' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Sport Participation Breakdown</Text>
            <Text style={styles.sectionSubtitle}>Distribution of competitive fixtures across sports</Text>

            {sportsBreakdown.map((s, idx) => {
              const maxMatches = 80;
              const percent = Math.min(100, Math.round((s.totalMatches / maxMatches) * 100));
              const formatEmoji = (type: string) => {
                if (type.includes('CRICKET')) return '🏏';
                if (type.includes('FUTSAL')) return '⚽';
                if (type.includes('BADMINTON')) return '🏸';
                return '🏀';
              };
              return (
                <View key={idx} style={styles.sportMetricCard}>
                  <View style={styles.sportCardHeader}>
                    <Text style={styles.sportCardTitle}>
                      {formatEmoji(s.sportType)} {s.sportType}
                    </Text>
                    <Text style={styles.sportCardCount}>
                      {s.totalMatches} matches ({s.liveMatches} LIVE)
                    </Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                  </View>
                  <View style={styles.sportCardFooter}>
                    <Text style={styles.sportCardDetail}>Completed: {s.completedMatches}</Text>
                    <Text style={styles.sportCardDetail}>Completion: {Math.round((s.completedMatches / s.totalMatches) * 100 || 0)}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 3: TEAM LEADERBOARD */}
        {activeTab === 'teams' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Grassroots Team Standings</Text>
            <Text style={styles.sectionSubtitle}>Ranked by tournament win rate percentage</Text>

            {SAMPLE_TEAMS.map((team, idx) => (
              <View key={team.id} style={styles.teamLeaderCard}>
                <View style={styles.teamRankNum}>
                  <Text style={styles.rankNumText}>#{idx + 1}</Text>
                </View>
                <View style={[styles.teamInitialsCircle, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.teamInitialsText}>{team.shortName}</Text>
                </View>
                <View style={styles.teamInfoCol}>
                  <Text style={styles.teamLeaderName} numberOfLines={1}>{team.teamName}</Text>
                  <View style={styles.formBadgeRow}>
                    <Text style={styles.teamFormLabel}>Form: </Text>
                    {team.form.map((f, i) => (
                      <View
                        key={i}
                        style={[
                          styles.formDot,
                          { backgroundColor: f === 'W' ? Colors.fourGreen : Colors.wicketRed },
                        ]}
                      >
                        <Text style={styles.formDotText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.winRateCol}>
                  <Text style={styles.winRateNum}>{team.winRate}%</Text>
                  <Text style={styles.winRateLabel}>{team.wins}W - {team.losses}L</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: TOP PLAYERS */}
        {activeTab === 'players' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Top Performers of the Season</Text>
            <Text style={styles.sectionSubtitle}>Outstanding grassroots athlete stats</Text>

            {SAMPLE_PLAYERS.map((p) => (
              <View key={p.id} style={styles.playerCard}>
                <View style={styles.playerTopRow}>
                  <View style={styles.playerAvatarBadge}>
                    <Text style={styles.playerAvatarEmoji}>
                      {p.sport === 'CRICKET' ? '🏏' : p.sport === 'FUTSAL' ? '⚽' : '🏸'}
                    </Text>
                  </View>
                  <View style={styles.playerMetaCol}>
                    <Text style={styles.playerCategoryPill}>{p.category}</Text>
                    <Text style={styles.playerNameText}>{p.playerName}</Text>
                    <Text style={styles.playerTeamSub}>{p.teamName}</Text>
                  </View>
                  <View style={styles.playerStatBadge}>
                    <Text style={styles.playerPrimaryStat}>{p.primaryStat}</Text>
                    <Text style={styles.playerSecondaryStat}>{p.secondaryStat}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    flex: 1,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiIcon: {
    fontSize: 18,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  subTabsContainer: {
    backgroundColor: Colors.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
  },
  subTabActive: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  subTabTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  tabSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  venueRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  venueRankInfo: {
    flex: 1,
  },
  venueRankName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  venueRankCity: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  matchesHostedBadge: {
    alignItems: 'flex-end',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchesHostedNum: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  matchesHostedLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  sportMetricCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sportCardCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSecondary,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  sportCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sportCardDetail: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  teamLeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamRankNum: {
    width: 24,
    marginRight: 6,
  },
  rankNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  teamInitialsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  teamInitialsText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  teamInfoCol: {
    flex: 1,
  },
  teamLeaderName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  formBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  teamFormLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  formDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 3,
  },
  formDotText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.white,
  },
  winRateCol: {
    alignItems: 'flex-end',
  },
  winRateNum: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  winRateLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  playerCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarEmoji: {
    fontSize: 20,
  },
  playerMetaCol: {
    flex: 1,
  },
  playerCategoryPill: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  playerTeamSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  playerStatBadge: {
    alignItems: 'flex-end',
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  playerPrimaryStat: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  playerSecondaryStat: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
