import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Match, TimelineEvent } from '../types/match.types';
import { socketService } from '../services/socketService';
import { matchService } from '../services/matchService';

interface LiveMatchScreenProps {
  matchId?: string;
  onBack?: () => void;
}

export const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ matchId, onBack }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'scorecard' | 'info'>('feed');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Pulse animation for LIVE badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  // Load actual match from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadMatch() {
      try {
        setLoading(true);
        if (matchId) {
          const m = await matchService.getMatchById(matchId);
          if (isMounted) setMatch(m);
        } else {
          const live = await matchService.getLiveMatches().catch(() => []);
          if (isMounted && Array.isArray(live) && live.length > 0) {
            setMatch(live[0]);
          } else {
            const all = await matchService.getMatches('ALL').catch(() => []);
            if (isMounted && Array.isArray(all) && all.length > 0) {
              setMatch(all[0]);
            } else {
              setMatch(null);
            }
          }
        }
      } catch {
        if (isMounted) setMatch(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMatch();
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  // Connect to WebSocket Gateway when match is active
  useEffect(() => {
    if (!match?.id) return;
    const idToUse = match.id;
    try {
      socketService.joinMatch(idToUse, (backendMatch) => {
        if (backendMatch) {
          setMatch((prev) => (prev ? { ...prev, ...backendMatch } : backendMatch));
          setIsLiveConnected(true);
        }
      });

      socketService.onScoreUpdated((payload) => {
        if (payload && payload.matchId === idToUse && payload.score) {
          setMatch((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              score: {
                ...prev.score,
                ...payload.score,
              },
            };
          });
          setIsLiveConnected(true);
        }
      });

      socketService.onStatusChanged((payload) => {
        if (payload && payload.matchId === idToUse && payload.match) {
          setMatch((prev) => (prev ? { ...prev, matchStatus: payload.match.matchStatus } : prev));
        }
      });
    } catch (e) {
      console.log('Socket connection:', e);
    }

    return () => {
      socketService.leaveMatch(idToUse);
    };
  }, [match?.id]);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'FOUR':
        return { backgroundColor: Colors.fourGreen, textColor: Colors.white };
      case 'SIX':
        return { backgroundColor: Colors.sixPurple, textColor: Colors.white };
      case 'WICKET':
      case 'GOAL':
        return { backgroundColor: Colors.wicketRed, textColor: Colors.white };
      case 'DOT':
        return { backgroundColor: Colors.surfaceSecondary, textColor: Colors.dotGray };
      default:
        return { backgroundColor: Colors.borderLight, textColor: Colors.textPrimary };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.textSecondary, fontSize: 13 }}>Loading match...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {onBack ? (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.tournamentName}>Live Matches</Text>
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🏏</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
            No Live Match In Progress
          </Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
            There are currently no active live matches in progress. When a tournament match begins and scores are updated, live ball-by-ball updates will stream here automatically.
          </Text>
          {Boolean(onBack) && (
            <TouchableOpacity
              style={{ backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 }}
              onPress={onBack}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Browse Scheduled Matches →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const homeTeamName = match.homeTeam?.teamName || 'Home Team';
  const homeTeamShort = match.homeTeam?.shortName || homeTeamName.slice(0, 3).toUpperCase();
  const awayTeamName = match.awayTeam?.teamName || 'Away Team';
  const awayTeamShort = match.awayTeam?.shortName || awayTeamName.slice(0, 3).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.headerTitleContainer}>
          <Text style={styles.tournamentName} numberOfLines={1}>
            {match.tournament?.tournamentName || 'SportLK Match'}
          </Text>
          <Text style={styles.venueSubtitle}>
            {match.venue?.venueName || 'Grassroots Ground'}
          </Text>
        </View>

        {/* Pulsing LIVE Badge */}
        <View style={styles.liveBadgeWrapper}>
          <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
          <Text style={styles.liveText}>{match.matchStatus || 'LIVE'}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO SCOREBOARD BANNER (Dark Slate Theme from Figma) */}
        <View style={styles.scoreboardBanner}>
          <View style={styles.scoreboardTopRow}>
            <View style={styles.sportTag}>
              <Text style={styles.sportTagText}>
                {match.sportType === 'CRICKET' ? '🏏 CRICKET' : '⚽ FUTSAL'} • {match.score?.detailedScorecardJson?.currentInningsOrHalf || match.matchStatus || 'LIVE'}
              </Text>
            </View>
            <Text style={styles.clockOrOversText}>
              {match.sportType === 'CRICKET'
                ? `Over ${match.score?.detailedScorecardJson?.overs || '0.0'}`
                : `${match.score?.detailedScorecardJson?.clock || '00:00'}`}
            </Text>
          </View>

          {/* Teams Grid */}
          <View style={styles.teamsGrid}>
            {/* Team A */}
            <View style={styles.teamCol}>
              <View style={[styles.teamAvatar, { backgroundColor: Colors.primary }]}>
                <Text style={styles.teamAvatarText}>{homeTeamShort}</Text>
              </View>
              <Text style={styles.teamName} numberOfLines={1}>{homeTeamName}</Text>
              <Text style={styles.teamScore}>{match.score?.homeTeamScoreDisplay || '0'}</Text>
            </View>

            {/* VS Divider */}
            <View style={styles.vsCol}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Team B */}
            <View style={styles.teamCol}>
              <View style={[styles.teamAvatar, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.teamAvatarText}>{awayTeamShort}</Text>
              </View>
              <Text style={styles.teamName} numberOfLines={1}>{awayTeamName}</Text>
              <Text style={styles.teamScore}>{match.score?.awayTeamScoreDisplay || '0'}</Text>
            </View>
          </View>

          {/* Equation Status Bar */}
          <View style={styles.equationBar}>
            <Text style={styles.equationText}>
              {match.score?.detailedScorecardJson?.currentStatus || `${homeTeamName} vs ${awayTeamName}`}
            </Text>
          </View>
        </View>

        {/* Recent Balls Strip (Cricket) */}
        {match.sportType === 'CRICKET' && (match.score?.detailedScorecardJson?.timeline?.length ?? 0) > 0 && (
          <View style={styles.recentBallsCard}>
            <Text style={styles.recentBallsTitle}>Recent:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ballsRow}>
              {(match.score?.detailedScorecardJson?.timeline || []).slice(0, 8).map((ev) => {
                const badge = getBadgeStyle(ev.type);
                return (
                  <View key={ev.id} style={[styles.ballCircle, { backgroundColor: badge.backgroundColor }]}>
                    <Text style={[styles.ballCircleText, { color: badge.textColor }]}>{ev.badgeText}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'feed' && styles.tabItemActive]}
            onPress={() => setActiveTab('feed')}
          >
            <Text style={[styles.tabItemText, activeTab === 'feed' && styles.tabItemTextActive]}>
              Live Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'scorecard' && styles.tabItemActive]}
            onPress={() => setActiveTab('scorecard')}
          >
            <Text style={[styles.tabItemText, activeTab === 'scorecard' && styles.tabItemTextActive]}>
              Scorecard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'info' && styles.tabItemActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabItemText, activeTab === 'info' && styles.tabItemTextActive]}>
              Match Info
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: LIVE FEED / COMMENTARY */}
        {activeTab === 'feed' && (
          <View style={styles.tabContent}>
            {/* Active Players Card */}
            {match.score?.detailedScorecardJson?.batsmen && match.score.detailedScorecardJson.batsmen.length > 0 && (
              <View style={styles.activePlayersCard}>
                <Text style={styles.sectionHeader}>ON CREASE</Text>
                {match.score.detailedScorecardJson.batsmen.map((b, idx) => (
                  <View key={idx} style={styles.playerRow}>
                    <Text style={styles.playerName}>
                      {b.name} {b.isStriker ? '★' : ''}
                    </Text>
                    <Text style={styles.playerFigures}>
                      {b.runsOrPoints} {b.ballsOrShots ? `(${b.ballsOrShots}b)` : ''} • SR {b.strikeRate || '140'}
                    </Text>
                  </View>
                ))}
                {match.score.detailedScorecardJson.bowler && (
                  <View style={[styles.playerRow, styles.bowlerRow]}>
                    <Text style={styles.playerName}>
                      🎳 {match.score.detailedScorecardJson.bowler.name}
                    </Text>
                    <Text style={styles.playerFigures}>
                      {match.score.detailedScorecardJson.bowler.wickets}/{match.score.detailedScorecardJson.bowler.runs} ({match.score.detailedScorecardJson.bowler.overs} ov)
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Ball-by-Ball Commentary Stream */}
            <Text style={[styles.sectionHeader, { marginTop: 16 }]}>BALL-BY-BALL COMMENTARY</Text>
            {(!match.score?.detailedScorecardJson?.timeline || match.score.detailedScorecardJson.timeline.length === 0) ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>No commentary updates yet for this match.</Text>
              </View>
            ) : (
              (match.score?.detailedScorecardJson?.timeline || []).map((item) => {
                const badge = getBadgeStyle(item.type);
                return (
                  <View key={item.id} style={styles.commentaryItem}>
                    <View style={styles.commentaryLeft}>
                      <View style={[styles.eventBadge, { backgroundColor: badge.backgroundColor }]}>
                        <Text style={[styles.eventBadgeText, { color: badge.textColor }]}>
                          {item.badgeText}
                        </Text>
                      </View>
                      <Text style={styles.overTimestamp}>{item.ballOrMinute}</Text>
                    </View>

                    <View style={styles.commentaryRight}>
                      <Text style={styles.commentaryDesc}>{item.description}</Text>
                      <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 2: SCORECARD */}
        {activeTab === 'scorecard' && (
          <View style={styles.tabContent}>
            <View style={styles.scorecardTable}>
              <Text style={styles.tableTitle}>{homeTeamName} Innings</Text>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, { flex: 2 }]}>Batter</Text>
                <Text style={styles.thCell}>R</Text>
                <Text style={styles.thCell}>B</Text>
                <Text style={styles.thCell}>4s</Text>
                <Text style={styles.thCell}>6s</Text>
                <Text style={styles.thCell}>SR</Text>
              </View>

              {(!match.score?.detailedScorecardJson?.batsmen || match.score.detailedScorecardJson.batsmen.length === 0) ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 11 }}>No batting records recorded yet.</Text>
                </View>
              ) : (
                match.score.detailedScorecardJson.batsmen.map((b, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.tdCell, { flex: 2, fontWeight: '600' }]}>{b.name}</Text>
                    <Text style={[styles.tdCell, { fontWeight: '700', color: Colors.primaryDark }]}>{b.runsOrPoints}</Text>
                    <Text style={styles.tdCell}>{b.ballsOrShots || 0}</Text>
                    <Text style={styles.tdCell}>{b.fours || 0}</Text>
                    <Text style={styles.tdCell}>{b.sixes || 0}</Text>
                    <Text style={styles.tdCell}>{b.strikeRate || '-'}</Text>
                  </View>
                ))
              )}
            </View>

            {match.sportType === 'CRICKET' && match.score?.detailedScorecardJson?.bowler && (
              <View style={[styles.scorecardTable, { marginTop: 16 }]}>
                <Text style={styles.tableTitle}>{awayTeamName} Bowling</Text>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { flex: 2 }]}>Bowler</Text>
                  <Text style={styles.thCell}>O</Text>
                  <Text style={styles.thCell}>M</Text>
                  <Text style={styles.thCell}>R</Text>
                  <Text style={styles.thCell}>W</Text>
                  <Text style={styles.thCell}>ECON</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tdCell, { flex: 2, fontWeight: '600' }]}>
                    {match.score.detailedScorecardJson.bowler.name}
                  </Text>
                  <Text style={styles.tdCell}>{match.score.detailedScorecardJson.bowler.overs}</Text>
                  <Text style={styles.tdCell}>{match.score.detailedScorecardJson.bowler.maidens}</Text>
                  <Text style={styles.tdCell}>{match.score.detailedScorecardJson.bowler.runs}</Text>
                  <Text style={[styles.tdCell, { fontWeight: '700', color: Colors.wicketRed }]}>
                    {match.score.detailedScorecardJson.bowler.wickets}
                  </Text>
                  <Text style={styles.tdCell}>
                    {match.score.detailedScorecardJson.bowler.overs ? (Number(match.score.detailedScorecardJson.bowler.runs) / Math.max(1, parseFloat(match.score.detailedScorecardJson.bowler.overs))).toFixed(2) : '-'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: MATCH INFO */}
        {activeTab === 'info' && (
          <View style={styles.tabContent}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tournament</Text>
                <Text style={styles.infoValue}>{match.tournament?.tournamentName || 'Friendly / Bilateral'}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{match.venue?.venueName || 'Colombo, Sri Lanka'}{match.venue?.city ? `, ${match.venue.city}` : ''}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teams</Text>
                <Text style={styles.infoValue}>{homeTeamName} vs {awayTeamName}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Live Streaming</Text>
                <Text style={[styles.infoValue, { color: Colors.primaryDark, fontWeight: '700' }]}>
                  {isLiveConnected ? '⚡ SportLK Live Gateway Active' : 'Connecting to Live Gateway...'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  backPlaceholder: {
    width: 36,
  },
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  tournamentName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  venueSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  liveBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.liveRedLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.liveRed,
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.liveRed,
    letterSpacing: 0.5,
  },
  scrollContent: {
    flex: 1,
  },
  scoreboardBanner: {
    margin: 16,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  scoreboardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportTagText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clockOrOversText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  teamsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  teamAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  teamScore: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.white,
  },
  vsCol: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  equationBar: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  equationText: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentBallsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentBallsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginRight: 10,
  },
  ballsRow: {
    flexDirection: 'row',
  },
  ballCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  ballCircleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabItemTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  activePlayersCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  bowlerRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  playerFigures: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  commentaryItem: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentaryLeft: {
    alignItems: 'center',
    marginRight: 12,
    width: 40,
  },
  eventBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  overTimestamp: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  commentaryRight: {
    flex: 1,
  },
  commentaryDesc: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  timeAgoText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  scorecardTable: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  thCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    alignItems: 'center',
  },
  tdCell: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
});
