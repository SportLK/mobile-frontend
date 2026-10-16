import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { COLORS } from '../theme';
import { Header } from '../components/Header';
import { BottomTabBar, TabKey } from '../components/BottomTabBar';

import { MyTeamScreen } from '../screens/MyTeamScreen';
import { SquadRequestsScreen } from '../screens/SquadRequestsScreen';
import { TeamChallengesScreen } from '../screens/TeamChallengesScreen';
import { ManageTeamsScreen } from '../screens/ManageTeamsScreen';

interface NavigationState {
  screen: string;
  params?: any;
}

export const RootNavigator: React.FC = () => {
  const [navState, setNavState] = useState<NavigationState>({ screen: 'MyTeam' });
  const [activeTab, setActiveTab] = useState<TabKey>('MyTeam');

  const navigate = (screen: string, params?: any) => {
    setNavState({ screen, params });

    if (screen === 'MyTeam') setActiveTab('MyTeam');
    else if (screen === 'Squad') setActiveTab('Squad');
    else if (screen === 'Challenges') setActiveTab('Challenges');
    else if (screen === 'Teams') setActiveTab('Teams');
  };

  const handleSelectTab = (tab: TabKey) => {
    setActiveTab(tab);
    switch (tab) {
      case 'MyTeam':
        navigate('MyTeam');
        break;
      case 'Squad':
        navigate('Squad');
        break;
      case 'Challenges':
        navigate('Challenges');
        break;
      case 'Teams':
        navigate('Teams');
        break;
    }
  };

  const renderScreen = () => {
    switch (navState.screen) {
      case 'MyTeam':
        return <MyTeamScreen onNavigate={navigate} />;
      case 'Squad':
        return (
          <SquadRequestsScreen
            onNavigate={navigate}
            initialTab={navState.params?.tab || 'roster'}
          />
        );
      case 'Challenges':
        return <TeamChallengesScreen onNavigate={navigate} />;
      case 'Teams':
        return <ManageTeamsScreen onNavigate={navigate} />;
      default:
        return <MyTeamScreen onNavigate={navigate} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Top Header */}
      <Header onPressManageTeams={() => navigate('Teams')} />

      {/* Main Screen Body */}
      <View style={styles.body}>{renderScreen()}</View>

      {/* Bottom Tab Bar */}
      <BottomTabBar currentTab={activeTab} onSelectTab={handleSelectTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
});
