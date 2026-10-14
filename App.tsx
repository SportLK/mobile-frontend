import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VenuesScreen } from './src/screens/VenuesScreen';
import { VenueDetailsScreen } from './src/screens/VenueDetailsScreen';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { LiveMatchScreen } from './src/screens/LiveMatchScreen';
import { Venue } from './src/types/venue.types';
import { Match } from './src/types/match.types';
import { Colors } from './src/theme/colors';

type Tab = 'venues' | 'matches' | 'live';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentTab, setCurrentTab] = useState<Tab>('matches');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setCurrentTab('live');
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        {/* Main Content View */}
        <View style={styles.content}>
          {currentTab === 'live' ? (
            <LiveMatchScreen
              matchId={selectedMatch?.id}
              onBack={() => {
                setCurrentTab('matches');
              }}
            />
          ) : currentTab === 'matches' ? (
            <MatchesScreen onSelectMatch={handleSelectMatch} />
          ) : selectedVenue ? (
            <VenueDetailsScreen
              venue={selectedVenue}
              onBack={() => setSelectedVenue(null)}
            />
          ) : (
            <VenuesScreen onSelectVenue={(venue) => setSelectedVenue(venue)} />
          )}
        </View>

        {/* Bottom Tab Navigation Bar matching Figma design */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navItem, currentTab === 'matches' && styles.navItemActive]}
            onPress={() => {
              setCurrentTab('matches');
              setSelectedVenue(null);
            }}
          >
            <Text style={styles.navIcon}>🏆</Text>
            <Text style={[styles.navLabel, currentTab === 'matches' && styles.navLabelActive]}>
              Matches
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentTab === 'live' && styles.navItemActive]}
            onPress={() => {
              setCurrentTab('live');
              setSelectedVenue(null);
            }}
          >
            <Text style={styles.navIcon}>🔴</Text>
            <Text style={[styles.navLabel, currentTab === 'live' && styles.navLabelActive]}>
              Live Match
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentTab === 'venues' && styles.navItemActive]}
            onPress={() => {
              setCurrentTab('venues');
              setSelectedVenue(null);
            }}
          >
            <Text style={styles.navIcon}>🏟️</Text>
            <Text style={[styles.navLabel, currentTab === 'venues' && styles.navLabelActive]}>
              Venues
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  navLabelActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
});

export default App;
