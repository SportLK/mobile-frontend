import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VenuesScreen } from './src/screens/VenuesScreen';
import { VenueDetailsScreen } from './src/screens/VenueDetailsScreen';
import { Venue } from './src/types/venue.types';
import { Colors } from './src/theme/colors';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        
      />
      <SafeAreaView style={styles.safeArea}>
        {selectedVenue ? (
          <VenueDetailsScreen
            venue={selectedVenue}
            onBack={() => setSelectedVenue(null)}
          />
        ) : (
          <VenuesScreen onSelectVenue={(venue) => setSelectedVenue(venue)} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default App;
