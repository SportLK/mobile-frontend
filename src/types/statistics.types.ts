export interface PlatformOverviewStats {
  matches: {
    total: number;
    byStatus: {
      SCHEDULED: number;
      LIVE: number;
      COMPLETED: number;
      ABANDONED?: number;
      POSTPONED?: number;
    };
  };
  venues: {
    total: number;
    active: number;
  };
  teams: {
    activeTotal: number;
  };
  tournaments: {
    total: number;
  };
  users?: {
    total: number;
    managers: number;
    organizers: number;
  };
}

export interface SportBreakdownItem {
  sportType: string;
  totalMatches: number;
  completedMatches: number;
  liveMatches: number;
}

export interface TopVenueItem {
  id: string;
  venueName: string;
  city: string;
  district?: string;
  matchesHosted: number;
}

export interface TeamLeaderboardItem {
  id: string;
  teamName: string;
  shortName: string;
  sportType: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  form: Array<'W' | 'L' | 'D'>;
}

export interface PlayerLeaderboardItem {
  id: string;
  playerName: string;
  teamName: string;
  sport: 'CRICKET' | 'FUTSAL' | 'BADMINTON';
  category: string;
  primaryStat: string;
  secondaryStat: string;
}
