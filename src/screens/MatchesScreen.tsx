import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Match, MatchStatus } from '../types/match.types';
import { SportType } from '../types/venue.types';
import { matchService } from '../services/matchService';
import { MatchCard } from '../components/MatchCard';
import { Colors } from '../theme/colors';

interface MatchesScreenProps {
  onSelectMatch: (match: Match) => void;
}

const STATUS_FILTERS: Array<{ label: string; value: MatchStatus | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: '🔴 Live', value: 'LIVE' },
  { label: 'Upcoming', value: 'SCHEDULED' },
  { label: 'Completed', value: 'COMPLETED' },
];

const SPORT_FILTERS: Array<{ label: string; value?: SportType }> = [
  { label: 'All Sports' },
  { label: '🏏 Cricket', value: 'CRICKET' },
  { label: '⚽ Futsal', value: 'FUTSAL' },
  { label: '🏸 Badminton', value: 'BADMINTON' },
  { label: '🏀 Basketball', value: 'BASKETBALL' },
];

// Fallback grassroots matches matching Figma design
const SAMPLE_MATCHES: Match[] = [
  {
    id: 'cricket-demo-1',
    sportType: 'CRICKET',
    matchStatus: 'LIVE',
    tournament: {
      id: 't-101',
      tournamentName: 'Western Province T20 League 2026',
    },
    homeTeamId: 'team-1',
    homeTeam: {
      id: 'team-1',
      teamName: 'Colombo Lions CC',
      shortName: 'COL',
    },
    awayTeamId: 'team-2',
    awayTeam: {
      id: 'team-2',
      teamName: 'Kandy Kings CC',
      shortName: 'KAN',
    },
    venue: {
      id: 'venue-1',
      venueName: 'Colombo Racecourse Grounds',
      city: 'Colombo 07',
    },
    scheduledStartTime: new Date().toISOString(),
    score: {
      homeTeamScoreDisplay: '146/3',
      awayTeamScoreDisplay: '158/7',
      detailedScorecardJson: {
        overs: '17.2',
        currentStatus: 'Colombo Lions need 13 runs from 16 balls to win',
      },
    },
  },
  {
    id: 'futsal-demo-2',
    sportType: 'FUTSAL',
    matchStatus: 'LIVE',
    tournament: {
      id: 't-102',
      tournamentName: 'Colombo Futsal Championship 2026',
    },
    homeTeamId: 'team-3',
    homeTeam: {
      id: 'team-3',
      teamName: 'CR&FC Strikers',
      shortName: 'CRFC',
    },
    awayTeamId: 'team-4',
    awayTeam: {
      id: 'team-4',
      teamName: 'Java Lane FC',
      shortName: 'JLFC',
    },
    venue: {
      id: 'venue-2',
      venueName: 'CR & FC Indoor Sports Arena',
      city: 'Colombo 07',
    },
    scheduledStartTime: new Date().toISOString(),
    score: {
      homeTeamScoreDisplay: '3',
      awayTeamScoreDisplay: '2',
      detailedScorecardJson: {
        clock: '34:18',
        currentStatus: 'CR&FC leading by 1 goal • 2nd Half',
      },
    },
  },
  {
    id: 'badminton-demo-3',
    sportType: 'BADMINTON',
    matchStatus: 'SCHEDULED',
    tournament: {
      id: 't-103',
      tournamentName: 'Sri Lanka Shuttle Open 2026',
    },
    homeTeamId: 'team-5',
    homeTeam: {
      id: 'team-5',
      teamName: 'Moratuwa Smashers',
      shortName: 'MOR',
    },
    awayTeamId: 'team-6',
    awayTeam: {
      id: 'team-6',
      teamName: 'Royal College Sports Club',
      shortName: 'RCSC',
    },
    venue: {
      id: 'venue-3',
      venueName: 'Otters Athletic Club Badminton Arena',
      city: 'Colombo 07',
    },
    scheduledStartTime: new Date(Date.now() + 7200000).toISOString(),
    score: {
      homeTeamScoreDisplay: '-',
      awayTeamScoreDisplay: '-',
      detailedScorecardJson: {
        currentStatus: 'Match starts at 5:30 PM • Court 1',
      },
    },
  },
  {
    id: 'cricket-demo-4',
    sportType: 'CRICKET',
    matchStatus: 'COMPLETED',
    tournament: {
      id: 't-101',
      tournamentName: 'Western Province T20 League 2026',
    },
    homeTeamId: 'team-7',
    homeTeam: {
      id: 'team-7',
      teamName: 'Galle Gladiators Grassroots',
      shortName: 'GG',
    },
    awayTeamId: 'team-8',
    awayTeam: {
      id: 'team-8',
      teamName: 'Negombo Titans CC',
      shortName: 'NT',
    },
    venue: {
      id: 'venue-4',
      venueName: 'Tyronne Fernando Stadium',
      city: 'Moratuwa',
    },
    scheduledStartTime: new Date(Date.now() - 86400000).toISOString(),
    score: {
      homeTeamScoreDisplay: '172/4 (20.0)',
      awayTeamScoreDisplay: '144/9 (20.0)',
      detailedScorecardJson: {
        currentStatus: 'Galle Gladiators won by 28 runs',
      },
    },
  },
];

export const MatchesScreen: React.FC<MatchesScreenProps> = ({ onSelectMatch }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'ALL'>('ALL');
  const [selectedSport, setSelectedSport] = useState<SportType | undefined>(undefined);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await matchService.getMatches(selectedStatus, selectedSport);
      if (data && data.length > 0) {
        setMatches(data);
      } else {
        // Fallback filter
        let filtered = SAMPLE_MATCHES;
        if (selectedStatus !== 'ALL') {
          filtered = filtered.filter((m) => m.matchStatus === selectedStatus);
        }
        if (selectedSport) {
          filtered = filtered.filter((m) => m.sportType === selectedSport);
        }
        setMatches(filtered);
      }
    } catch (error) {
      console.warn('Failed to fetch matches from API, using fallback:', error);
      let filtered = SAMPLE_MATCHES;
      if (selectedStatus !== 'ALL') {
        filtered = filtered.filter((m) => m.matchStatus === selectedStatus);
      }
      if (selectedSport) {
        filtered = filtered.filter((m) => m.sportType === selectedSport);
      }
      setMatches(filtered);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus, selectedSport]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matches & Schedule</Text>
        <Text style={styles.subtitle}>
          Grassroots tournaments, fixtures & live scores
        </Text>
      </View>

      {/* Status Segmented Tabs */}
      <View style={styles.statusTabsRow}>
        {STATUS_FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.statusTab, selectedStatus === tab.value && styles.statusTabActive]}
            onPress={() => setSelectedStatus(tab.value)}
          >
            <Text style={[styles.statusTabText, selectedStatus === tab.value && styles.statusTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sport Chips Filter Strip */}
      <View style={styles.sportStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportChipsList}>
          {SPORT_FILTERS.map((s, idx) => {
            const isSelected = selectedSport === s.value;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.sportChip, isSelected && styles.sportChipActive]}
                onPress={() => setSelectedSport(s.value)}
              >
                <Text style={[styles.sportChipText, isSelected && styles.sportChipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Matches List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MatchCard match={item} onPress={() => onSelectMatch(item)} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🏟️</Text>
              <Text style={styles.emptyTitle}>No Matches Found</Text>
              <Text style={styles.emptySubtitle}>
                No matches currently match your filter criteria. Try selecting another sport or status.
              </Text>
            </View>
          }
        />
      )}
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
    paddingBottom: 10,
    backgroundColor: Colors.card,
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
  statusTabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 3,
    backgroundColor: Colors.surfaceSecondary,
  },
  statusTabActive: {
    backgroundColor: Colors.primaryLight,
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusTabTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  sportStrip: {
    backgroundColor: Colors.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sportChipsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
  },
  sportChipActive: {
    backgroundColor: Colors.primary,
  },
  sportChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sportChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
