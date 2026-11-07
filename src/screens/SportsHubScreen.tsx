import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { VenuesScreen } from './VenuesScreen';
import { VenueDetailsScreen } from './VenueDetailsScreen';
import { MatchesScreen } from './MatchesScreen';
import { LiveMatchScreen } from './LiveMatchScreen';
import { StatisticsScreen } from './StatisticsScreen';
import { Venue } from '../types/venue.types';
import { Match } from '../types/match.types';
import { Colors } from '../theme/colors';

export type SportsHubTab = 'venues' | 'matches' | 'live' | 'stats';

interface SportsHubScreenProps {
  initialTab?: SportsHubTab;
}

export default function SportsHubScreen({ initialTab = 'venues' }: SportsHubScreenProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentTab, setCurrentTab] = useState<SportsHubTab>(initialTab);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setCurrentTab('live');
  };

  return (
    <View style={styles.container}>
      {/* Top Segmented Sub-navigation Bar */}
      <View style={styles.topSegmentBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topSegmentScroll}
        >
          <TouchableOpacity
            style={[styles.segmentPill, currentTab === 'venues' && styles.segmentPillActive]}
            onPress={() => {
              setCurrentTab('venues');
              setSelectedVenue(null);
            }}
          >
            <Text style={styles.segmentIcon}>🏟️</Text>
            <Text style={[styles.segmentLabel, currentTab === 'venues' && styles.segmentLabelActive]}>
              Venues & Grounds
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentPill, currentTab === 'matches' && styles.segmentPillActive]}
            onPress={() => {
              setCurrentTab('matches');
              setSelectedVenue(null);
            }}
          >
            <Text style={styles.segmentIcon}>🏏</Text>
            <Text style={[styles.segmentLabel, currentTab === 'matches' && styles.segmentLabelActive]}>
              Matches
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentPill, currentTab === 'live' && styles.segmentPillActive]}
            onPress={() => {
              setCurrentTab('live');
              setSelectedVenue(null);
            }}
          >
            <Text style={styles.segmentIcon}>🔴</Text>
            <Text style={[styles.segmentLabel, currentTab === 'live' && styles.segmentLabelActive]}>
              Live Score
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentPill, currentTab === 'stats' && styles.segmentPillActive]}
            onPress={() => {
              setCurrentTab('stats');
              setSelectedVenue(null);
            }}
          >
            <Text style={styles.segmentIcon}>📊</Text>
            <Text style={[styles.segmentLabel, currentTab === 'stats' && styles.segmentLabelActive]}>
              Statistics
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        {currentTab === 'live' ? (
          <LiveMatchScreen matchId={selectedMatch?.id} onBack={() => setCurrentTab('matches')} />
        ) : currentTab === 'matches' ? (
          <MatchesScreen onSelectMatch={handleSelectMatch} />
        ) : currentTab === 'stats' ? (
          <StatisticsScreen />
        ) : selectedVenue ? (
          <VenueDetailsScreen venue={selectedVenue} onBack={() => setSelectedVenue(null)} />
        ) : (
          <VenuesScreen onSelectVenue={setSelectedVenue} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topSegmentBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  topSegmentScroll: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
  },
  segmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  segmentIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  segmentLabelActive: {
    color: '#059669',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
