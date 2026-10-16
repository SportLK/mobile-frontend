/**
 * SportLK Mobile App - Member 2 (Team & Squad Management)
 * React Native 0.87
 */

import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TeamProvider } from './src/context/TeamContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/theme';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
        <TeamProvider>
          <RootNavigator />
        </TeamProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

export default App;
