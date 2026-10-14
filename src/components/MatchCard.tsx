import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Match } from '../types/match.types';
import { Colors } from '../theme/colors';

interface MatchCardProps {
  match: Match;
  onPress: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const isLive = match.matchStatus === 'LIVE';
  const isScheduled = match.matchStatus === 'SCHEDULED';
  const isCompleted = match.matchStatus === 'COMPLETED';

  const formatSportEmoji = (sport: string) => {
    switch (sport) {
      case 'CRICKET': return '🏏';
      case 'FUTSAL': return '⚽';
      case 'BADMINTON': return '🏸';
      case 'BASKETBALL': return '🏀';
      default: return '🏆';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isLive && styles.liveCardBorder]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.tournamentContainer}>
          <Text style={styles.tournamentName} numberOfLines={1}>
            {formatSportEmoji(match.sportType)} {match.tournament?.tournamentName || 'SportLK Championship'}
          </Text>
          <Text style={styles.venueText} numberOfLines={1}>
            📍 {match.venue?.venueName || 'Colombo Sports Complex'}
          </Text>
        </View>

        {/* Status Badge */}
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}
        {isScheduled && (
          <View style={styles.scheduledBadge}>
            <Text style={styles.scheduledBadgeText}>UPCOMING</Text>
          </View>
        )}
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>FINAL</Text>
          </View>
        )}
      </View>

      {/* Teams Head-to-Head Row */}
      <View style={styles.teamsRow}>
        {/* Home Team */}
        <View style={styles.teamSide}>
          <View style={[styles.teamAvatar, { backgroundColor: Colors.primary }]}>
            <Text style={styles.teamAvatarText}>{match.homeTeam.shortName || 'HT'}</Text>
          </View>
          <Text style={styles.teamName} numberOfLines={1}>{match.homeTeam.teamName}</Text>
          <Text style={styles.teamScore}>
            {match.score?.homeTeamScoreDisplay || (isScheduled ? '-' : '0')}
          </Text>
        </View>

        {/* Center VS / Clock */}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
          {isLive && match.score?.detailedScorecardJson?.overs && (
            <Text style={styles.oversText}>Ov {match.score.detailedScorecardJson.overs}</Text>
          )}
          {isLive && match.score?.detailedScorecardJson?.clock && (
            <Text style={styles.oversText}>{match.score.detailedScorecardJson.clock}</Text>
          )}
          {isScheduled && (
            <Text style={styles.scheduledTimeText}>
              {new Date(match.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        {/* Away Team */}
        <View style={[styles.teamSide, styles.awayTeamSide]}>
          <View style={[styles.teamAvatar, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.teamAvatarText}>{match.awayTeam.shortName || 'AT'}</Text>
          </View>
          <Text style={styles.teamName} numberOfLines={1}>{match.awayTeam.teamName}</Text>
          <Text style={styles.teamScore}>
            {match.score?.awayTeamScoreDisplay || (isScheduled ? '-' : '0')}
          </Text>
        </View>
      </View>

      {/* Card Footer / Status ticker */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerText, isLive && styles.footerTextLive]} numberOfLines={1}>
          {match.score?.detailedScorecardJson?.currentStatus || (
            isLive ? 'Match currently in progress' :
            isScheduled ? `Scheduled for ${new Date(match.scheduledStartTime).toLocaleDateString()}` :
            'Match completed'
          )}
        </Text>
        <Text style={styles.viewLinkText}>
          {isLive ? 'Live Scoreboard →' : 'Details →'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  liveCardBorder: {
    borderColor: Colors.primaryLight,
    borderWidth: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  tournamentContainer: {
    flex: 1,
    marginRight: 8,
  },
  tournamentName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  venueText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.liveRedLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.liveRed,
    marginRight: 4,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.liveRed,
  },
  scheduledBadge: {
    backgroundColor: Colors.tagScheduled,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scheduledBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tagScheduledText,
  },
  completedBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  teamSide: {
    flex: 1,
    alignItems: 'center',
  },
  awayTeamSide: {
    alignItems: 'center',
  },
  teamAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  teamAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  teamScore: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  vsContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  oversText: {
    fontSize: 10,
    color: Colors.primaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  scheduledTimeText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  footerTextLive: {
    color: '#D97706',
    fontWeight: '600',
  },
  viewLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
});
