import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  FlatList,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Match, TimelineEvent, PlayerScoreItem } from '../types/match.types';
import { socketService } from '../services/socketService';
import { matchService } from '../services/matchService';

interface LiveMatchScreenProps {
  matchId?: string;
  onBack?: () => void;
}

// Fallback high-fidelity sample matches for grassroots sports
const INITIAL_CRICKET_MATCH: Match = {
  id: 'cricket-demo-1',
  sportType: 'CRICKET',
  matchStatus: 'LIVE',
  tournament: {
    id: 't-101',
    tournamentName: 'Western Province T20 League 2026',
  },
  homeTeamId: 'team-1',
  homeTeam: {
    id: 'team-1',
    teamName: 'Colombo Lions CC',
    shortName: 'COL',
  },
  awayTeamId: 'team-2',
  awayTeam: {
    id: 'team-2',
    teamName: 'Kandy Kings CC',
    shortName: 'KAN',
  },
  venue: {
    id: 'venue-1',
    venueName: 'Colombo Racecourse Grounds',
    city: 'Colombo 07',
  },
  scheduledStartTime: new Date().toISOString(),
  score: {
    homeTeamScoreDisplay: '146/3',
    awayTeamScoreDisplay: '158/7',
    detailedScorecardJson: {
      currentInningsOrHalf: '2nd Innings',
      overs: '17.2',
      currentStatus: 'Colombo Lions need 13 runs from 16 balls to win',
      stats: {
        runRate: '8.42',
        reqRate: '4.88',
      },
      batsmen: [
        { name: 'Kusal Mendis', runsOrPoints: 58, ballsOrShots: 38, fours: 6, sixes: 2, strikeRate: '152.6', isStriker: true },
        { name: 'Dasun Shanaka', runsOrPoints: 26, ballsOrShots: 16, fours: 2, sixes: 1, strikeRate: '162.5', isStriker: false },
      ],
      bowler: {
        name: 'Wanindu Hasaranga',
        overs: '3.2',
        maidens: 0,
        runs: 24,
        wickets: 2,
      },
      timeline: [
        {
          id: 'b-1',
          ballOrMinute: '17.2',
          type: 'FOUR',
          badgeText: '4',
          description: 'FOUR! Smacked through extra cover! Beautiful lofted drive by Kusal Mendis finds the boundary rope.',
          timeAgo: 'Just now',
        },
        {
          id: 'b-2',
          ballOrMinute: '17.1',
          type: 'RUN',
          badgeText: '1',
          description: 'Single taken towards long-on. Shanaka pushes it softly into the gap and rotates the strike.',
          timeAgo: '1m ago',
        },
        {
          id: 'b-3',
          ballOrMinute: '16.6',
          type: 'SIX',
          badgeText: '6',
          description: 'SIX! Maximum! In the slot and launched high over deep mid-wicket into the grandstand!',
          timeAgo: '2m ago',
        },
        {
          id: 'b-4',
          ballOrMinute: '16.5',
          type: 'DOT',
          badgeText: '0',
          description: 'Beaten by the wrong-un! Spinning past the outside edge as Mendis looks to cut.',
          timeAgo: '3m ago',
        },
        {
          id: 'b-5',
          ballOrMinute: '16.4',
          type: 'WICKET',
          badgeText: 'W',
          description: 'WICKET! Clean bowled! The googly clips the top of off-stump! Huge breakthrough for Kandy Kings.',
          timeAgo: '4m ago',
        },
        {
          id: 'b-6',
          ballOrMinute: '16.3',
          type: 'FOUR',
          badgeText: '4',
          description: 'FOUR! Sliced over backward point. The fielder at third man cannot cut it off.',
          timeAgo: '5m ago',
        },
      ],
    },
  },
};

const INITIAL_FUTSAL_MATCH: Match = {
  id: 'futsal-demo-2',
  sportType: 'FUTSAL',
  matchStatus: 'LIVE',
  tournament: {
    id: 't-102',
    tournamentName: 'Colombo Futsal Championship 2026',
  },
  homeTeamId: 'team-3',
  homeTeam: {
    id: 'team-3',
    teamName: 'CR&FC Strikers',
    shortName: 'CRFC',
  },
  awayTeamId: 'team-4',
  awayTeam: {
    id: 'team-4',
    teamName: 'Java Lane FC',
    shortName: 'JLFC',
  },
  venue: {
    id: 'venue-2',
    venueName: 'CR & FC Indoor Sports Arena',
    city: 'Colombo 07',
  },
  scheduledStartTime: new Date().toISOString(),
  score: {
    homeTeamScoreDisplay: '3',
    awayTeamScoreDisplay: '2',
    detailedScorecardJson: {
      currentInningsOrHalf: '2nd Half',
      clock: '34:18',
      currentStatus: 'CR&FC leading by 1 goal • 5 minutes remaining',
      stats: {
        possession: '54% - 46%',
        shots: '12 - 9',
      },
      batsmen: [
        { name: 'Mohamed Aaqil (CRFC)', runsOrPoints: 2, ballsOrShots: 5 },
        { name: 'R. Perera (JLFC)', runsOrPoints: 2, ballsOrShots: 4 },
      ],
      timeline: [
        {
          id: 'f-1',
          ballOrMinute: '33\'',
          type: 'GOAL',
          badgeText: '⚽',
          description: 'GOAL! Sensational counter-attack! Aaqil finishes into the bottom-right corner!',
          timeAgo: '1m ago',
        },
        {
          id: 'f-2',
          ballOrMinute: '28\'',
          type: 'GOAL',
          badgeText: '⚽',
          description: 'GOAL for Java Lane! Powerful volley from outside the penalty box levels the score.',
          timeAgo: '6m ago',
        },
      ],
    },
  },
};

export const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ matchId, onBack }) => {
  const [selectedSport, setSelectedSport] = useState<'CRICKET' | 'FUTSAL'>('CRICKET');
  const [match, setMatch] = useState<Match>(INITIAL_CRICKET_MATCH);
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
      ])
    ).start();
  }, [pulseAnim]);

  // Connect to WebSocket Gateway
  useEffect(() => {
    const idToUse = matchId || match.id;
    try {
      socketService.joinMatch(idToUse, (backendMatch) => {
        if (backendMatch) {
          setMatch((prev) => ({ ...prev, ...backendMatch }));
          setIsLiveConnected(true);
        }
      });

      socketService.onScoreUpdated((payload) => {
        if (payload && payload.matchId === idToUse && payload.score) {
          setMatch((prev) => ({
            ...prev,
            score: {
              ...prev.score,
              ...payload.score,
            },
          }));
          setIsLiveConnected(true);
        }
      });

      socketService.onStatusChanged((payload) => {
        if (payload && payload.matchId === idToUse && payload.match) {
          setMatch((prev) => ({ ...prev, matchStatus: payload.match.matchStatus }));
        }
      });
    } catch (e) {
      console.log('Running in local live match mode:', e);
    }

    return () => {
      socketService.leaveMatch(idToUse);
    };
  }, [matchId, match.id]);

  // Switch between demo sports
  const handleSwitchSport = (sport: 'CRICKET' | 'FUTSAL') => {
    setSelectedSport(sport);
    setMatch(sport === 'CRICKET' ? INITIAL_CRICKET_MATCH : INITIAL_FUTSAL_MATCH);
  };

  // Interactive Live Ball Simulation (for demo & examiners)
  const handleSimulateNextBall = () => {
    if (match.sportType === 'CRICKET') {
      const outcomes = [
        { type: 'FOUR' as const, badge: '4', desc: 'FOUR! Pulled powerfully behind square leg to the boundary rope!', runs: 4, isWicket: false },
        { type: 'SIX' as const, badge: '6', desc: 'SIX! Colossal strike! Clears the long-off boundary by miles!', runs: 6, isWicket: false },
        { type: 'RUN' as const, badge: '1', desc: 'Single taken into the covers. Good call, quick running between wickets.', runs: 1, isWicket: false },
        { type: 'DOT' as const, badge: '0', desc: 'Dot ball. Good length delivery defended back to the bowler.', runs: 0, isWicket: false },
        { type: 'WICKET' as const, badge: 'W', desc: 'WICKET! Caught at deep mid-wicket! Tried to clear the fence but mistimed.', runs: 0, isWicket: true },
      ];
      const pick = outcomes[Math.floor(Math.random() * outcomes.length)];

      const currentScoreStr = match.score?.homeTeamScoreDisplay || '146/3';
      const [runsPart, wktsPart] = currentScoreStr.split('/');
      const currentRuns = parseInt(runsPart || '146', 10);
      const currentWkts = parseInt(wktsPart || '3', 10);

      const newRuns = currentRuns + pick.runs;
      const newWkts = pick.isWicket ? Math.min(10, currentWkts + 1) : currentWkts;
      const newScoreStr = `${newRuns}/${newWkts}`;

      const currentOvers = parseFloat(match.score?.detailedScorecardJson?.overs || '17.2');
      const nextOver = (currentOvers + 0.1).toFixed(1);

      const newEvent: TimelineEvent = {
        id: `b-${Date.now()}`,
        ballOrMinute: nextOver,
        type: pick.type,
        badgeText: pick.badge,
        description: pick.desc,
        timeAgo: 'Just now',
      };

      const updatedTimeline = [newEvent, ...(match.score?.detailedScorecardJson?.timeline || [])];

      setMatch((prev) => ({
        ...prev,
        score: {
          ...prev.score,
          homeTeamScoreDisplay: newScoreStr,
          awayTeamScoreDisplay: prev.score?.awayTeamScoreDisplay || '158/7',
          detailedScorecardJson: {
            ...prev.score?.detailedScorecardJson,
            overs: nextOver,
            currentStatus: `Colombo Lions: ${newScoreStr} (${nextOver} Ov) • Target 159`,
            timeline: updatedTimeline,
          },
        },
      }));
    } else {
      // Futsal simulation
      const currentGoals = parseInt(match.score?.homeTeamScoreDisplay || '3', 10) + 1;
      const newEvent: TimelineEvent = {
        id: `f-${Date.now()}`,
        ballOrMinute: '36\'',
        type: 'GOAL',
        badgeText: '⚽',
        description: 'GOAL! Cracking low drive inside the left post! The crowd goes wild!',
        timeAgo: 'Just now',
      };
      setMatch((prev) => ({
        ...prev,
        score: {
          ...prev.score,
          homeTeamScoreDisplay: currentGoals.toString(),
          awayTeamScoreDisplay: prev.score?.awayTeamScoreDisplay || '2',
          detailedScorecardJson: {
            ...prev.score?.detailedScorecardJson,
            timeline: [newEvent, ...(prev.score?.detailedScorecardJson?.timeline || [])],
            currentStatus: `CR&FC: ${currentGoals} - JLFC: ${prev.score?.awayTeamScoreDisplay || '2'}`,
          },
        },
      }));
    }
  };

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
            {match.tournament?.tournamentName || 'SportLK Championship'}
          </Text>
          <Text style={styles.venueSubtitle}>
            {match.venue?.venueName}
          </Text>
        </View>

        {/* Pulsing LIVE Badge */}
        <View style={styles.liveBadgeWrapper}>
          <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Sport Toggle & Simulation Action Bar */}
      <View style={styles.topActionBar}>
        <View style={styles.sportChipContainer}>
          <TouchableOpacity
            style={[styles.sportChip, selectedSport === 'CRICKET' && styles.sportChipActive]}
            onPress={() => handleSwitchSport('CRICKET')}
          >
            <Text style={[styles.sportChipText, selectedSport === 'CRICKET' && styles.sportChipTextActive]}>
              🏏 Cricket
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sportChip, selectedSport === 'FUTSAL' && styles.sportChipActive]}
            onPress={() => handleSwitchSport('FUTSAL')}
          >
            <Text style={[styles.sportChipText, selectedSport === 'FUTSAL' && styles.sportChipTextActive]}>
              ⚽ Futsal
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.simButton} onPress={handleSimulateNextBall}>
          <Text style={styles.simButtonText}>⚡ Next Ball</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO SCOREBOARD BANNER (Dark Slate Theme from Figma) */}
        <View style={styles.scoreboardBanner}>
          <View style={styles.scoreboardTopRow}>
            <View style={styles.sportTag}>
              <Text style={styles.sportTagText}>
                {match.sportType === 'CRICKET' ? '🏏 CRICKET' : '⚽ FUTSAL'} • {match.score?.detailedScorecardJson?.currentInningsOrHalf || 'LIVE'}
              </Text>
            </View>
            <Text style={styles.clockOrOversText}>
              {match.sportType === 'CRICKET'
                ? `Over ${match.score?.detailedScorecardJson?.overs || '0.0'}`
                : `${match.score?.detailedScorecardJson?.clock || '30:00'}`}
            </Text>
          </View>

          {/* Teams Grid */}
          <View style={styles.teamsGrid}>
            {/* Team A */}
            <View style={styles.teamCol}>
              <View style={[styles.teamAvatar, { backgroundColor: Colors.primary }]}>
                <Text style={styles.teamAvatarText}>{match.homeTeam.shortName || 'COL'}</Text>
              </View>
              <Text style={styles.teamName} numberOfLines={1}>{match.homeTeam.teamName}</Text>
              <Text style={styles.teamScore}>{match.score?.homeTeamScoreDisplay || '0'}</Text>
            </View>

            {/* VS Divider */}
            <View style={styles.vsCol}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Team B */}
            <View style={styles.teamCol}>
              <View style={[styles.teamAvatar, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.teamAvatarText}>{match.awayTeam.shortName || 'KAN'}</Text>
              </View>
              <Text style={styles.teamName} numberOfLines={1}>{match.awayTeam.teamName}</Text>
              <Text style={styles.teamScore}>{match.score?.awayTeamScoreDisplay || '0'}</Text>
            </View>
          </View>

          {/* Equation Status Bar */}
          <View style={styles.equationBar}>
            <Text style={styles.equationText}>
              {match.score?.detailedScorecardJson?.currentStatus || 'Match in progress'}
            </Text>
          </View>
        </View>

        {/* Recent Balls Strip (Cricket) */}
        {match.sportType === 'CRICKET' && (
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
            {match.score?.detailedScorecardJson?.batsmen && (
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
            {(match.score?.detailedScorecardJson?.timeline || []).map((item) => {
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
            })}
          </View>
        )}

        {/* TAB 2: SCORECARD */}
        {activeTab === 'scorecard' && (
          <View style={styles.tabContent}>
            <View style={styles.scorecardTable}>
              <Text style={styles.tableTitle}>{match.homeTeam.teamName} Innings</Text>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, { flex: 2 }]}>Batter</Text>
                <Text style={styles.thCell}>R</Text>
                <Text style={styles.thCell}>B</Text>
                <Text style={styles.thCell}>4s</Text>
                <Text style={styles.thCell}>6s</Text>
                <Text style={styles.thCell}>SR</Text>
              </View>

              {(match.score?.detailedScorecardJson?.batsmen || []).map((b, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tdCell, { flex: 2, fontWeight: '600' }]}>{b.name}</Text>
                  <Text style={[styles.tdCell, { fontWeight: '700', color: Colors.primaryDark }]}>{b.runsOrPoints}</Text>
                  <Text style={styles.tdCell}>{b.ballsOrShots || 0}</Text>
                  <Text style={styles.tdCell}>{b.fours || 0}</Text>
                  <Text style={styles.tdCell}>{b.sixes || 0}</Text>
                  <Text style={styles.tdCell}>{b.strikeRate || '-'}</Text>
                </View>
              ))}
            </View>

            {match.sportType === 'CRICKET' && match.score?.detailedScorecardJson?.bowler && (
              <View style={[styles.scorecardTable, { marginTop: 16 }]}>
                <Text style={styles.tableTitle}>{match.awayTeam.teamName} Bowling</Text>
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
                  <Text style={styles.tdCell}>7.20</Text>
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
                <Text style={styles.infoValue}>{match.tournament?.tournamentName}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{match.venue?.venueName}, {match.venue?.city}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Toss</Text>
                <Text style={styles.infoValue}>{match.homeTeam.teamName} won the toss & elected to bat</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Live Streaming</Text>
                <Text style={[styles.infoValue, { color: Colors.primaryDark, fontWeight: '700' }]}>
                  ⚡ SportLK Live Gateway Active
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
  topActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
  },
  sportChipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
  },
  sportChipActive: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  sportChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sportChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  simButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  simButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
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
