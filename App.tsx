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
import { LiveMatchScreen } from './src/screens/LiveMatchScreen';
import { Venue } from './src/types/venue.types';
import { Colors } from './src/theme/colors';

type Tab = 'venues' | 'live';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentTab, setCurrentTab] = useState<Tab>('live');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        {/* Main Content View */}
        <View style={styles.content}>
          {currentTab === 'live' ? (
            <LiveMatchScreen />
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
    paddingHorizontal: 24,
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
