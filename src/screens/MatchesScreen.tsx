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
      setMatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn('Failed to fetch matches from API:', error);
      setMatches([]);
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
