import { SportType } from './venue.types';

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'ABANDONED' | 'POSTPONED';

export interface TimelineEvent {
  id: string;
  ballOrMinute: string;
  type: 'FOUR' | 'SIX' | 'WICKET' | 'RUN' | 'DOT' | 'GOAL' | 'POINT';
  badgeText: string;
  description: string;
  timeAgo: string;
}

export interface PlayerScoreItem {
  name: string;
  runsOrPoints: number;
  ballsOrShots?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: string;
  isStriker?: boolean;
}

export interface DetailedScorecard {
  currentStatus?: string;
  currentInningsOrHalf?: string;
  overs?: string;
  clock?: string;
  batsmen?: PlayerScoreItem[];
  bowler?: {
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
  };
  timeline?: TimelineEvent[];
  stats?: {
    runRate?: string;
    reqRate?: string;
    possession?: string;
    shots?: string;
  };
}

export interface MatchScorecard {
  id?: string;
  matchId?: string;
  homeTeamScoreDisplay: string;
  awayTeamScoreDisplay: string;
  detailedScorecardJson?: DetailedScorecard;
  updatedAt?: string;
}

export interface Match {
  id: string;
  tournamentId?: string;
  tournament?: {
    id: string;
    tournamentName: string;
  };
  sportType: SportType;
  homeTeamId: string;
  homeTeam: {
    id: string;
    teamName: string;
    shortName?: string;
    logoUrl?: string;
  };
  awayTeamId: string;
  awayTeam: {
    id: string;
    teamName: string;
    shortName?: string;
    logoUrl?: string;
  };
  venueId?: string;
  venue?: {
    id: string;
    venueName: string;
    city: string;
  };
  scheduledStartTime: string;
  matchStatus: MatchStatus;
  winnerTeamId?: string;
  score?: MatchScorecard;
}
