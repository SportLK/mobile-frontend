import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { useTeamContext } from '../context/TeamContext';
import { CreateTeamModal } from '../components/Modals';

interface ManageTeamsScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const ManageTeamsScreen: React.FC<ManageTeamsScreenProps> = ({ onNavigate }) => {
  const { teams, activeTeam, switchActiveTeam } = useTeamContext();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const handleSelectTeam = (teamId: string) => {
    switchActiveTeam(teamId);
    onNavigate('MyTeam');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Manage Teams</Text>
        <Text style={styles.subtitle}>
          Create, switch, and manage all squads under your manager account.
        </Text>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.createBtnText}>+ Create New Team</Text>
      </TouchableOpacity>

      {/* Teams List */}
      <View style={styles.list}>
        {teams.map((t) => {
          const isActive = t.id === activeTeam.id;

          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.teamCard, isActive && styles.teamCardActive]}
              onPress={() => handleSelectTeam(t.id)}
              activeOpacity={0.85}
            >
              {/* Header */}
              <View style={styles.teamHeader}>
                <View style={[styles.avatarCircle, isActive && styles.avatarCircleActive]}>
                  <Text style={[styles.avatarText, isActive && styles.avatarTextActive]}>
                    {t.initials}
                  </Text>
                </View>

                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{t.name}</Text>
                  <Text style={styles.teamMeta}>
                    {t.sport} · {t.location} · {t.level}
                  </Text>
                </View>

                {isActive ? (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Active</Text>
                  </View>
                ) : (
                  <View style={styles.switchPill}>
                    <Text style={styles.switchPillText}>Switch</Text>
                  </View>
                )}
              </View>

              {/* Bio summary */}
              <Text style={styles.bioText} numberOfLines={2}>
                {t.bio}
              </Text>

              {/* Stats Footer */}
              <View style={styles.statsFooter}>
                <View style={styles.statCol}>
                  <Text style={styles.statNum}>{t.playersCount}</Text>
                  <Text style={styles.statLbl}>Players</Text>
                </View>

                <View style={styles.statCol}>
                  <Text style={styles.statNum}>{t.matchesCount}</Text>
                  <Text style={styles.statLbl}>Matches</Text>
                </View>

                <View style={styles.statCol}>
                  <Text style={styles.statNum}>{t.winsCount}</Text>
                  <Text style={styles.statLbl}>Wins</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <CreateTeamModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 36,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: 3,
    lineHeight: 19,
  },
  createBtn: {
    backgroundColor: COLORS.black,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  createBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    gap: 16,
  },
  teamCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: 18,
  },
  teamCardActive: {
    borderColor: COLORS.primaryDark,
    borderWidth: 1.5,
    backgroundColor: '#FBFEEF',
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarCircleActive: {
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gray700,
  },
  avatarTextActive: {
    color: COLORS.primaryText,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  teamMeta: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: COLORS.activeBadgeBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.activeBadgeText,
  },
  switchPill: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  switchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  bioText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
    marginBottom: 16,
  },
  statsFooter: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.black,
  },
  statLbl: {
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 1,
  },
});
