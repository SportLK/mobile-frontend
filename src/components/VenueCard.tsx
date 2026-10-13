import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Venue } from '../types/venue.types';
import { Colors } from '../theme/colors';

interface VenueCardProps {
  venue: Venue;
  onPress: (venue: Venue) => void;
}

// Fallback high quality sports turf image
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80';

export const VenueCard: React.FC<VenueCardProps> = ({ venue, onPress }) => {
  const primaryFacility = venue.facilities?.[0];
  const distanceDisplay =
    venue.distanceKm !== undefined ? `${venue.distanceKm} km away` : venue.city;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress(venue)}
    >
      <Image
        source={{ uri: venue.imageUrl || FALLBACK_IMAGE }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {venue.venueName}
          </Text>
          {venue.hourlyBaseRate > 0 && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>
                LKR {venue.hourlyBaseRate.toLocaleString()}
                <Text style={styles.priceSub}>/hr</Text>
              </Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {venue.addressLine}, {venue.city} •{' '}
            <Text style={styles.distanceHighlight}>{distanceDisplay}</Text>
          </Text>
        </View>

        {/* Facilities Badges */}
        <View style={styles.facilitiesRow}>
          {primaryFacility && (
            <View style={[styles.badge, styles.sportBadge]}>
              <Text style={styles.sportBadgeText}>{primaryFacility.sportType}</Text>
            </View>
          )}

          {venue.facilities?.some((f) => f.hasFloodlights) && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>💡 Floodlights</Text>
            </View>
          )}

          {venue.facilities?.some((f) => f.hasParking) && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🅿️ Parking</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.surfaceSecondary,
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  priceBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  priceSub: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationPin: {
    fontSize: 12,
    marginRight: 4,
  },
  addressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  distanceHighlight: {
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sportBadge: {
    backgroundColor: '#EEF2FF',
  },
  sportBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
});
