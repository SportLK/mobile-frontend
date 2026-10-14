import { apiFetch } from './api';
import { Match, MatchScorecard } from '../types/match.types';

export const matchService = {
  /**
   * Get all matches filtered by status & sport
   */
  async getMatches(status?: string, sportType?: string): Promise<Match[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (sportType) params.append('sportType', sportType);

    const queryString = params.toString();
    return apiFetch<Match[]>(`/matches${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get single match with scores and teams
   */
  async getMatchById(id: string): Promise<Match> {
    return apiFetch<Match>(`/matches/${id}`);
  },

  /**
   * Update match score (organizer / simulation)
   */
  async updateScore(matchId: string, scoreData: Partial<MatchScorecard>): Promise<MatchScorecard> {
    return apiFetch<MatchScorecard>(`/matches/${matchId}/score`, {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
  },
};
