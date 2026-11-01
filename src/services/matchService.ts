import { apiFetch } from './api';
import { Match, MatchScorecard, MatchStatus } from '../types/match.types';

export const matchService = {
  /**
   * Get all matches with optional status & sport filters
   */
  async getMatches(status?: MatchStatus | 'ALL', sportType?: string): Promise<Match[]> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') {
      params.append('matchStatus', status);
    }
    if (sportType && sportType !== 'ALL') {
      params.append('sportType', sportType);
    }

    const queryString = params.toString();
    return apiFetch<Match[]>(`/matches${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get live matches with instant scores
   */
  async getLiveMatches(): Promise<Match[]> {
    return apiFetch<Match[]>('/matches/live');
  },

  /**
   * Get single match with full details
   */
  async getMatchById(id: string): Promise<Match> {
    return apiFetch<Match>(`/matches/${id}`);
  },

  /**
   * Update match score (organizer / simulation)
   */
  async updateScore(matchId: string, scoreData: Partial<MatchScorecard>): Promise<MatchScorecard> {
    return apiFetch<MatchScorecard>(`/matches/${matchId}/score`, {
      method: 'PUT',
      body: JSON.stringify(scoreData),
    });
  },
};
