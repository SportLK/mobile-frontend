import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Venue, SportType } from '../types/venue.types';
import { venueService } from '../services/venueService';
import { VenueCard } from '../components/VenueCard';
import { Colors } from '../theme/colors';

interface VenuesScreenProps {
  onSelectVenue: (venue: Venue) => void;
}

const SPORT_FILTERS: Array<{ label: string; value?: SportType }> = [
  { label: 'All' },
  { label: 'Cricket', value: 'CRICKET' },
  { label: 'Futsal', value: 'FUTSAL' },
  { label: 'Badminton', value: 'BADMINTON' },
  { label: 'Basketball', value: 'BASKETBALL' },
];

const RADIUS_OPTIONS = [5, 10, 15, 25];

// Default center coordinates (Colombo, Sri Lanka)
const DEFAULT_LAT = 6.9271;
const DEFAULT_LNG = 79.8612;

export const VenuesScreen: React.FC<VenuesScreenProps> = ({ onSelectVenue }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<SportType | undefined>(undefined);
  const [selectedRadius, setSelectedRadius] = useState<number>(15);

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      const data = await venueService.getNearbyVenues({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        radiusInKm: selectedRadius,
        sportType: selectedSport,
      });
      setVenues(data);
    } catch (error) {
      console.warn('Failed to fetch venues, loading fallback list:', error);
      // Fallback sample data matching Figma design if backend is temporarily disconnected
      setVenues([
        {
          id: '1',
          venueName: 'CR & FC Futsal Grounds',
          addressLine: 'Maitland Crescent',
          city: 'Colombo 07',
          district: 'Colombo',
          province: 'Western',
          contactPhone: '0112695349',
          hourlyBaseRate: 3500,
          isActive: true,
          latitude: 6.9085,
          longitude: 79.8665,
          distanceKm: 2.4,
          facilities: [
            {
              id: '1',
              venueId: '1',
              sportType: 'FUTSAL',
              courtOrPitchCount: 2,
              hasFloodlights: true,
              hasParking: true,
              hasChangingRooms: true,
            },
          ],
        },
        {
          id: '2',
          venueName: 'Colombo Indoor Sports Arena',
          addressLine: 'Torrington Avenue',
          city: 'Colombo 07',
          district: 'Colombo',
          province: 'Western',
          contactPhone: '0112684210',
          hourlyBaseRate: 2800,
          isActive: true,
          latitude: 6.9032,
          longitude: 79.8711,
          distanceKm: 3.1,
          facilities: [
            {
              id: '2',
              venueId: '2',
              sportType: 'BADMINTON',
              courtOrPitchCount: 4,
              hasFloodlights: true,
              hasParking: true,
              hasChangingRooms: true,
            },
          ],
        },
        {
          id: '3',
          venueName: 'Thurstan Turf Cricket Complex',
          addressLine: 'Thurstan Road',
          city: 'Colombo 03',
          district: 'Colombo',
          province: 'Western',
          contactPhone: '0112586741',
          hourlyBaseRate: 4500,
          isActive: true,
          latitude: 6.9015,
          longitude: 79.8601,
          distanceKm: 3.8,
          facilities: [
            {
              id: '3',
              venueId: '3',
              sportType: 'CRICKET',
              courtOrPitchCount: 3,
              hasFloodlights: true,
              hasParking: false,
              hasChangingRooms: true,
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRadius, selectedSport]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVenues();
  };

  const filteredVenues = venues.filter((v) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.venueName.toLowerCase().includes(query) ||
      v.city.toLowerCase().includes(query) ||
      v.addressLine.toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Arena</Text>
        <Text style={styles.subtitle}>Discover sports grounds & courts near you</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search venue name, city, or district..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Sport Category Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {SPORT_FILTERS.map((item) => {
            const isSelected = selectedSport === item.value;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedSport(item.value)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Radius Filter row */}
        <View style={styles.radiusRow}>
          <Text style={styles.radiusLabel}>Radius:</Text>
          {RADIUS_OPTIONS.map((rad) => {
            const isSelected = selectedRadius === rad;
            return (
              <TouchableOpacity
                key={rad}
                style={[styles.radiusPill, isSelected && styles.radiusPillActive]}
                onPress={() => setSelectedRadius(rad)}
              >
                <Text
                  style={[styles.radiusPillText, isSelected && styles.radiusPillTextActive]}
                >
                  {rad} km
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Venues List */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Searching nearby arenas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVenues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VenueCard venue={item} onPress={onSelectVenue} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🏟️</Text>
              <Text style={styles.emptyTitle}>No Venues Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search radius or sport filter.
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  filtersContainer: {
    backgroundColor: Colors.card,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chipsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
  },
  chipActive: {
    backgroundColor: Colors.textPrimary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 2,
  },
  radiusLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  radiusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  radiusPillActive: {
    backgroundColor: Colors.primaryLight,
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  radiusPillTextActive: {
    color: Colors.primaryDark,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
