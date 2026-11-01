import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Venue } from '../types/venue.types';
import { Colors } from '../theme/colors';

interface VenueDetailsScreenProps {
  venue: Venue;
  onBack: () => void;
}

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80';

export const VenueDetailsScreen: React.FC<VenueDetailsScreenProps> = ({ venue, onBack }) => {
  const handleCall = () => {
    if (venue.contactPhone) {
      Linking.openURL(`tel:${venue.contactPhone}`).catch(() => {
        Alert.alert('Unable to place call', `Phone number: ${venue.contactPhone}`);
      });
    } else {
      Alert.alert('Contact Phone', 'No phone number listed for this venue.');
    }
  };

  const handleDirections = () => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
    Linking.openURL(mapUrl).catch(() => {
      Alert.alert('Directions', `Coordinates: ${venue.latitude}, ${venue.longitude}`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Floating Back Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {venue.venueName}
        </Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleDirections}>
          <Text style={styles.shareIcon}>🗺️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={{ uri: venue.imageUrl || HERO_FALLBACK }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.body}>
          {/* Title & Rate Header */}
          <View style={styles.titleSection}>
            <View style={styles.titleCol}>
              <Text style={styles.venueName}>{venue.venueName}</Text>
              <Text style={styles.locationSubtitle}>
                📍 {venue.addressLine}, {venue.city}
              </Text>
            </View>

            {venue.hourlyBaseRate > 0 && (
              <View style={styles.rateBox}>
                <Text style={styles.rateAmount}>
                  LKR {venue.hourlyBaseRate.toLocaleString()}
                </Text>
                <Text style={styles.rateUnit}>hourly base</Text>
              </View>
            )}
          </View>

          {/* Distance Indicator Pill */}
          {venue.distanceKm !== undefined && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>
                🚗 Approx. {venue.distanceKm} km from your current location
              </Text>
            </View>
          )}

          {/* Action Buttons: Call & Directions */}
          <View style={styles.actionRow}>
            {venue.contactPhone && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.callBtn]}
                onPress={handleCall}
                activeOpacity={0.85}
              >
                <Text style={styles.callBtnText}>📞 Call Venue</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.dirBtn]}
              onPress={handleDirections}
              activeOpacity={0.85}
            >
              <Text style={styles.dirBtnText}>🗺️ Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Facilities & Amenities Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facilities & Features</Text>

            <View style={styles.amenitiesGrid}>
              {venue.facilities && venue.facilities.length > 0 ? (
                venue.facilities.map((fac, idx) => (
                  <View key={idx} style={styles.facilityCard}>
                    <Text style={styles.facilitySport}>{fac.sportType}</Text>
                    <Text style={styles.facilityCourts}>
                      {fac.courtOrPitchCount} {fac.courtOrPitchCount === 1 ? 'Pitch/Court' : 'Pitches/Courts'}
                    </Text>

                    <View style={styles.amenityPills}>
                      <Text style={styles.amenityPill}>
                        {fac.hasFloodlights ? '✅ Floodlights' : '❌ No lights'}
                      </Text>
                      <Text style={styles.amenityPill}>
                        {fac.hasParking ? '✅ Parking' : '❌ No parking'}
                      </Text>
                      <Text style={styles.amenityPill}>
                        {fac.hasChangingRooms ? '✅ Changing rooms' : '❌ No changing rooms'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noFacilitiesText}>
                  Standard multi-purpose sports ground.
                </Text>
              )}
            </View>
          </View>

          {/* Tournament Organizer Notice (From Figma & SRS) */}
          <View style={styles.organizerNotice}>
            <Text style={styles.noticeIcon}>🏆</Text>
            <View style={styles.noticeBody}>
              <Text style={styles.noticeTitle}>Tournament Selection</Text>
              <Text style={styles.noticeDescription}>
                This venue is cataloged for selection by verified Tournament Organizers when hosting official SportLK amateur competitions.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  shareButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.surfaceSecondary,
  },
  body: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleCol: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  rateBox: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'flex-end',
  },
  rateAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  rateUnit: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  distanceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    backgroundColor: Colors.primary,
  },
  callBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  dirBtn: {
    backgroundColor: Colors.textPrimary,
  },
  dirBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  amenitiesGrid: {
    gap: 12,
  },
  facilityCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  facilitySport: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  facilityCourts: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  amenityPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityPill: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  noFacilitiesText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  organizerNotice: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noticeIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  noticeBody: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  noticeDescription: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
  },
});
