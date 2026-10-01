import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { TeamProvider } from './src/context/TeamContext';
import { TeamsMainScreen } from './src/screens/teams/TeamsMainScreen';
import { CreateTeamScreen } from './src/screens/teams/CreateTeamScreen';
import { TeamDetailScreen } from './src/screens/teams/TeamDetailScreen';

import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

import { BottomNavBar } from './src/components/BottomNavBar';

type TabType = 'home' | 'explore' | 'teams' | 'community' | 'profile';
type StackScreen = 'main' | 'create-team' | 'team-detail';

function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('teams');
  const [currentScreen, setCurrentScreen] = useState<StackScreen>('main');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    setCurrentScreen('team-detail');
  };

  const handleNavigateToCreateTeam = () => {
    setCurrentScreen('create-team');
  };

  const handleBackToMain = () => {
    setCurrentScreen('main');
  };

  const renderActiveScreen = () => {
    if (currentScreen === 'create-team') {
      return (
        <CreateTeamScreen
          onBack={handleBackToMain}
          onSuccess={(newTeamId) => {
            setSelectedTeamId(newTeamId);
            setCurrentScreen('team-detail');
          }}
        />
      );
    }

    if (currentScreen === 'team-detail' && selectedTeamId) {
      return (
        <TeamDetailScreen
          teamId={selectedTeamId}
          onBack={handleBackToMain}
        />
      );
    }

    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateToTeams={() => setCurrentTab('teams')}
            onNavigateToCreateTeam={handleNavigateToCreateTeam}
          />
        );
      case 'explore':
        return <ExploreScreen />;
      case 'teams':
        return (
          <TeamsMainScreen
            onNavigateToCreateTeam={handleNavigateToCreateTeam}
            onSelectTeam={handleSelectTeam}
          />
        );
      case 'community':
        return <CommunityScreen />;
      case 'profile':
        return (
          <ProfileScreen
            onNavigateToTeams={() => setCurrentTab('teams')}
            onNavigateToCreateTeam={handleNavigateToCreateTeam}
          />
        );
      default:
        return (
          <TeamsMainScreen
            onNavigateToCreateTeam={handleNavigateToCreateTeam}
            onSelectTeam={handleSelectTeam}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <TeamProvider>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            {renderActiveScreen()}
            {currentScreen === 'main' && (
              <BottomNavBar
                currentTab={currentTab}
                onSelectTab={(tab) => setCurrentTab(tab)}
              />
            )}
          </View>
        </SafeAreaView>
      </TeamProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

export default App;
