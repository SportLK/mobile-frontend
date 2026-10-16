import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { useTeamContext } from '../context/TeamContext';
import { CreateChallengeModal } from '../components/Modals';

interface TeamChallengesScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const TeamChallengesScreen: React.FC<TeamChallengesScreenProps> = () => {
  const { challenges, activeTeam, acceptChallenge, declineChallenge } = useTeamContext();
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'open'>('received');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const receivedChallenges = challenges.filter((c) => c.direction === 'received');
  const sentChallenges = challenges.filter((c) => c.direction === 'sent');
  const openChallenges = challenges.filter((c) => c.direction === 'open');

  const getDisplayList = () => {
    switch (activeTab) {
      case 'received':
        return receivedChallenges;
      case 'sent':
        return sentChallenges;
      case 'open':
        return openChallenges;
    }
  };

  const list = getDisplayList();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Team Challenges</Text>
        <Text style={styles.subtitle}>
          Manage challenges and match responses for {activeTeam.name}.
        </Text>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={styles.createChallengeBtn}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.createChallengeBtnText}>+ Create Team Challenge</Text>
      </TouchableOpacity>

      {/* Segmented Tabs (Received / Sent / Open) */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'received' && styles.tabButtonActive]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
            Received ({receivedChallenges.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'sent' && styles.tabButtonActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
            Sent ({sentChallenges.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'open' && styles.tabButtonActive]}
          onPress={() => setActiveTab('open')}
        >
          <Text style={[styles.tabText, activeTab === 'open' && styles.tabTextActive]}>
            Browse ({openChallenges.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Challenges List */}
      <View style={styles.listSection}>
        {list.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No challenges in this section</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'received'
                ? 'Incoming challenges from other teams will appear here.'
                : activeTab === 'sent'
                ? 'Create a challenge to challenge an opponent.'
                : 'No open public challenges right now.'}
            </Text>
          </View>
        ) : (
          list.map((item) => {
            const opponent =
              item.direction === 'sent' ? item.challengedTeam : item.challengerTeam;
            const isPending = item.status === 'Pending';
            const isAccepted = item.status === 'Accepted';
            const isDeclined = item.status === 'Declined';

            return (
              <View key={item.id} style={styles.challengeCard}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isAccepted
                        ? styles.statusAccepted
                        : isDeclined
                        ? styles.statusDeclined
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isAccepted
                          ? styles.statusAcceptedText
                          : isDeclined
                          ? styles.statusDeclinedText
                          : styles.statusPendingText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Opponent Info */}
                <Text style={styles.opponentName}>{opponent}</Text>
                <Text style={styles.opponentMeta}>{item.sport}</Text>
                <Text style={styles.dateVenueText}>{item.dateVenue}</Text>

                {/* Challenge Response Actions (for Received & Open) */}
                {item.direction === 'received' && (
                  <View style={styles.actionContainer}>
                    {isPending ? (
                      <View style={styles.responseActionsRow}>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => acceptChallenge(item.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.acceptBtnText}>Accept Challenge</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.declineBtn}
                          onPress={() => declineChallenge(item.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.answeredBox}>
                        <Text style={styles.answeredText}>
                          {isAccepted ? 'You accepted this challenge' : 'You declined this challenge'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Open Challenge action */}
                {item.direction === 'open' && (
                  <TouchableOpacity
                    style={[styles.acceptBtn, isAccepted && styles.acceptedFullBtn]}
                    onPress={() => acceptChallenge(item.id)}
                    disabled={isAccepted}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.acceptBtnText, isAccepted && styles.acceptedFullBtnText]}>
                      {isAccepted ? 'Challenge Accepted ✓' : 'Accept Challenge'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Sent Challenge status indicator */}
                {item.direction === 'sent' && (
                  <View style={styles.sentStatusBox}>
                    <Text style={styles.sentStatusText}>
                      {isPending
                        ? `Awaiting response from ${item.challengedTeam}`
                        : `${item.challengedTeam} responded: ${item.status}`}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      <CreateChallengeModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} />
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
  },
  createChallengeBtn: {
    backgroundColor: COLORS.black,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  createChallengeBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  tabTextActive: {
    color: COLORS.black,
    fontWeight: '800',
  },
  listSection: {
    gap: 16,
  },
  challengeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: COLORS.activeBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.activeBadgeText,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPending: {
    backgroundColor: COLORS.pendingBadgeBg,
  },
  statusPendingText: {
    color: COLORS.pendingBadgeText,
    fontSize: 11,
    fontWeight: '700',
  },
  statusAccepted: {
    backgroundColor: COLORS.activeBadgeBg,
  },
  statusAcceptedText: {
    color: COLORS.activeBadgeText,
    fontSize: 11,
    fontWeight: '700',
  },
  statusDeclined: {
    backgroundColor: COLORS.liveBadgeBg,
  },
  statusDeclinedText: {
    color: COLORS.liveBadgeText,
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  opponentName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  opponentMeta: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 2,
  },
  dateVenueText: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 8,
    marginBottom: 16,
  },
  actionContainer: {
    marginTop: 4,
  },
  responseActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: COLORS.primaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  declineBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  declineBtnText: {
    color: COLORS.gray700,
    fontSize: 13,
    fontWeight: '700',
  },
  acceptedFullBtn: {
    backgroundColor: COLORS.activeBadgeBg,
  },
  acceptedFullBtnText: {
    color: COLORS.activeBadgeText,
  },
  answeredBox: {
    backgroundColor: COLORS.gray50,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  answeredText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  sentStatusBox: {
    backgroundColor: COLORS.gray100,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  sentStatusText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.gray400,
    textAlign: 'center',
    lineHeight: 18,
  },
});
