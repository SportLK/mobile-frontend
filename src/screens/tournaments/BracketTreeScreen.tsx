import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { tournamentService } from '../../services/tournamentService';
import {
  BracketRound,
  BracketTreeResponse,
  Tournament,
  TournamentBracketNode,
} from '../../types/tournament.types';

interface Props {
  tournament: Tournament;
  onBack: () => void;
  onTournamentUpdated?: () => void;
}

export default function BracketTreeScreen({
  tournament,
  onBack,
  onTournamentUpdated,
}: Props) {
  const { accessToken, roles, workspace } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [advancingMatchId, setAdvancingMatchId] = useState<string | null>(null);

  const [bracketData, setBracketData] = useState<BracketTreeResponse | null>(null);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);

  const isOrganizer = workspace === 'organizer' || roles.includes('organizer');

  // Load bracket data
  const loadBracket = useCallback(async () => {
    try {
      const data = await tournamentService.getBracketTree(tournament.id);
      setBracketData(data);
    } catch {
      // Bracket might not be generated yet
      setBracketData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tournament.id]);

  useEffect(() => {
    loadBracket();
  }, [loadBracket]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBracket();
  };

  // Generate Bracket
  const handleGenerateBracket = async () => {
    if (!accessToken) {
      Alert.alert('Authentication', 'Please log in to generate the tournament bracket.');
      return;
    }

    Alert.alert(
      'Generate Tournament Bracket',
      'This will seed registered teams into single-elimination knockout matches. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate ⚡',
          onPress: async () => {
            try {
              setGenerating(true);
              await tournamentService.generateBracket(accessToken, tournament.id, {
                seedRandomly: true,
              });
              Alert.alert('Bracket Created! 🏆', 'Tournament bracket matches have been seeded.');
              await loadBracket();
              if (onTournamentUpdated) onTournamentUpdated();
            } catch (err: any) {
              Alert.alert('Generation Error', err?.message || 'Could not generate bracket tree.');
            } finally {
              setGenerating(false);
            }
          },
        },
      ],
    );
  };

  // Advance Match Winner
  const handleAdvanceWinner = async (
    bracketId: string,
    winnerTeamId: string,
    teamName: string,
  ) => {
    if (!accessToken) {
      Alert.alert('Authentication', 'Please log in to record match winners.');
      return;
    }

    Alert.alert(
      'Crown Match Winner',
      `Advance "${teamName}" to the next knockout round?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Winner 👑',
          onPress: async () => {
            try {
              setAdvancingMatchId(bracketId);
              await tournamentService.advanceMatchWinner(
                accessToken,
                tournament.id,
                bracketId,
                winnerTeamId,
              );
              Alert.alert('Winner Advanced! 🏆', `${teamName} has moved forward in the bracket.`);
              await loadBracket();
              if (onTournamentUpdated) onTournamentUpdated();
            } catch (err: any) {
              Alert.alert('Progression Error', err?.message || 'Could not advance match winner.');
            } finally {
              setAdvancingMatchId(null);
            }
          },
        },
      ],
    );
  };

  const rounds: BracketRound[] = bracketData?.rounds || [];
  const currentRound = rounds[selectedRoundIndex] || null;

  return (
    <View style={s.container}>
      {/* ── Top Header ────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <Pressable style={s.backBtn} onPress={onBack}>
          <Text style={s.backBtnText}>← Back</Text>
        </Pressable>
        <View style={s.topBarTitleWrap}>
          <Text style={s.topBarTitle}>Knockout Bracket Tree</Text>
          <Text style={s.topBarSubtitle}>{tournament.tournamentName}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <View style={s.heroBanner}>
          <View style={s.heroTop}>
            <View style={s.badgePill}>
              <Text style={s.badgeText}>KNOCKOUT PROGRESSION</Text>
            </View>
            <Text style={s.sportTag}>{tournament.sportType} 🏆</Text>
          </View>
          <Text style={s.heroTitle}>Tournament Bracket & Finals</Text>
          <Text style={s.heroDesc}>
            Interactive knockout tree showing real-time matchups, scores, and winner auto-advancement
            to the championship round.
          </Text>

          {/* Organizer Quick Action Button */}
          {isOrganizer && (
            <Pressable
              style={[s.generateBtn, generating && s.btnDisabled]}
              onPress={handleGenerateBracket}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={s.generateBtnText}>
                  {rounds.length > 0 ? '⚡ Re-generate Bracket' : '⚡ Auto-Generate Bracket Tree'}
                </Text>
              )}
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={s.mutedText}>Loading bracket matchups...</Text>
          </View>
        ) : rounds.length === 0 ? (
          /* Empty State: No bracket generated yet */
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🏆</Text>
            <Text style={s.emptyTitle}>No Bracket Generated</Text>
            <Text style={s.emptySubtitle}>
              The tournament bracket has not been seeded yet. Once participating teams are confirmed,
              the organizer can generate single-elimination knockout rounds.
            </Text>
            {isOrganizer && (
              <Pressable style={s.primaryActionBtn} onPress={handleGenerateBracket}>
                <Text style={s.primaryActionBtnText}>Generate Bracket Now ⚡</Text>
              </Pressable>
            )}
          </View>
        ) : (
          /* Bracket Round Tabs & Match Nodes */
          <View>
            {/* Round Selector Bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.roundTabBar}
            >
              {rounds.map((round, idx) => {
                const active = selectedRoundIndex === idx;
                return (
                  <Pressable
                    key={round.roundNumber || idx}
                    style={[s.roundTab, active && s.roundTabActive]}
                    onPress={() => setSelectedRoundIndex(idx)}
                  >
                    <Text style={[s.roundTabText, active && s.roundTabTextActive]}>
                      {round.roundName || `Round ${round.roundNumber}`}
                    </Text>
                    <View style={[s.matchCountPill, active && s.matchCountPillActive]}>
                      <Text style={[s.matchCountText, active && s.matchCountTextActive]}>
                        {round.matches.length}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Current Round Matches List */}
            {currentRound && (
              <View style={s.matchesSection}>
                <View style={s.roundHeaderRow}>
                  <Text style={s.roundHeaderTitle}>
                    {currentRound.roundName.toUpperCase()} ({currentRound.matches.length} MATCHES)
                  </Text>
                  <Text style={s.roundHeaderSub}>
                    {isOrganizer ? 'Tap "Crown Winner" to advance team' : 'Match fixtures'}
                  </Text>
                </View>

                {currentRound.matches.map((node: TournamentBracketNode, index: number) => {
                  const isAdvancing = advancingMatchId === node.bracketId;
                  const hasWinner = Boolean(node.winner);

                  return (
                    <View key={node.bracketId || index} style={s.matchNodeCard}>
                      {/* Node Header */}
                      <View style={s.nodeTopBar}>
                        <Text style={s.matchNumberText}>
                          Match #{node.sequence || index + 1}
                        </Text>
                        {hasWinner ? (
                          <View style={s.finishedBadge}>
                            <Text style={s.finishedBadgeText}>FINISHED ✓</Text>
                          </View>
                        ) : node.team1 && node.team2 ? (
                          <View style={s.readyBadge}>
                            <Text style={s.readyBadgeText}>READY TO PLAY</Text>
                          </View>
                        ) : (
                          <View style={s.waitingBadge}>
                            <Text style={s.waitingBadgeText}>AWAITING WINNER</Text>
                          </View>
                        )}
                      </View>

                      {/* Team 1 Row */}
                      <View
                        style={[
                          s.teamRow,
                          node.winner?.id === node.team1?.id && s.winnerTeamRow,
                        ]}
                      >
                        <View style={s.teamAvatarCircle}>
                          <Text style={s.teamAvatarChar}>
                            {node.team1?.name?.[0] || '1'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              s.teamNameText,
                              node.winner?.id === node.team1?.id && s.winnerText,
                            ]}
                          >
                            {node.team1?.name || 'TBD (Previous Match Winner)'}
                          </Text>
                          {node.winner?.id === node.team1?.id && (
                            <Text style={s.winnerTag}>👑 ROUND WINNER</Text>
                          )}
                        </View>

                        {/* Organizer Crown Winner Button */}
                        {isOrganizer && !hasWinner && node.team1 && node.team2 && (
                          <Pressable
                            style={s.crownWinnerBtn}
                            onPress={() =>
                              handleAdvanceWinner(
                                node.bracketId,
                                node.team1!.id,
                                node.team1!.name,
                              )
                            }
                            disabled={isAdvancing}
                          >
                            <Text style={s.crownWinnerBtnText}>👑 Win</Text>
                          </Pressable>
                        )}
                      </View>

                      {/* VS Divider */}
                      <View style={s.vsDividerRow}>
                        <View style={s.dividerLine} />
                        <Text style={s.vsText}>VS</Text>
                        <View style={s.dividerLine} />
                      </View>

                      {/* Team 2 Row */}
                      <View
                        style={[
                          s.teamRow,
                          node.winner?.id === node.team2?.id && s.winnerTeamRow,
                        ]}
                      >
                        <View style={s.teamAvatarCircle}>
                          <Text style={s.teamAvatarChar}>
                            {node.team2?.name?.[0] || '2'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              s.teamNameText,
                              node.winner?.id === node.team2?.id && s.winnerText,
                            ]}
                          >
                            {node.team2?.name || 'TBD (Previous Match Winner)'}
                          </Text>
                          {node.winner?.id === node.team2?.id && (
                            <Text style={s.winnerTag}>👑 ROUND WINNER</Text>
                          )}
                        </View>

                        {/* Organizer Crown Winner Button */}
                        {isOrganizer && !hasWinner && node.team1 && node.team2 && (
                          <Pressable
                            style={s.crownWinnerBtn}
                            onPress={() =>
                              handleAdvanceWinner(
                                node.bracketId,
                                node.team2!.id,
                                node.team2!.name,
                              )
                            }
                            disabled={isAdvancing}
                          >
                            <Text style={s.crownWinnerBtnText}>👑 Win</Text>
                          </Pressable>
                        )}
                      </View>

                      {isAdvancing && (
                        <View style={s.advancingOverlay}>
                          <ActivityIndicator size="small" color="#10B981" />
                          <Text style={s.advancingText}>Advancing winner...</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  topBarTitleWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  topBarSubtitle: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sportTag: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  generateBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  mutedText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  primaryActionBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  roundTabBar: {
    gap: 8,
    marginBottom: 16,
  },
  roundTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  roundTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  roundTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  roundTabTextActive: {
    color: '#FFFFFF',
  },
  matchCountPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  matchCountPillActive: {
    backgroundColor: '#10B981',
  },
  matchCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  matchCountTextActive: {
    color: '#FFFFFF',
  },
  matchesSection: {
    gap: 12,
  },
  roundHeaderRow: {
    marginBottom: 4,
  },
  roundHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
  },
  roundHeaderSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  matchNodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  nodeTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  matchNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  finishedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  finishedBadgeText: {
    color: '#065F46',
    fontSize: 9,
    fontWeight: '800',
  },
  readyBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  readyBadgeText: {
    color: '#3730A3',
    fontSize: 9,
    fontWeight: '800',
  },
  waitingBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  waitingBadgeText: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '800',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  winnerTeamRow: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  teamAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAvatarChar: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  teamNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  winnerText: {
    color: '#065F46',
    fontWeight: '800',
  },
  winnerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 1,
  },
  crownWinnerBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  crownWinnerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  vsDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  vsText: {
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: '800',
    color: '#D1D5DB',
  },
  advancingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  advancingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
});

