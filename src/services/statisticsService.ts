import { apiFetch } from './api';
import { PlatformOverviewStats, SportBreakdownItem, TopVenueItem } from '../types/statistics.types';

export const statisticsService = {
  /**
   * Get high-level platform KPIs
   */
  async getOverview(): Promise<PlatformOverviewStats> {
    return apiFetch<PlatformOverviewStats>('/statistics/overview');
  },

  /**
   * Get match statistics & sports popularity breakdown
   */
  async getMatchStatistics(): Promise<{ sportsBreakdown: SportBreakdownItem[]; recentCompleted: any[] }> {
    return apiFetch<{ sportsBreakdown: SportBreakdownItem[]; recentCompleted: any[] }>('/statistics/matches');
  },

  /**
   * Get venue utilization & top grounds
   */
  async getVenueStatistics(): Promise<{ topVenues: TopVenueItem[]; cityDistribution: any[]; facilitiesOverview: any }> {
    return apiFetch<{ topVenues: TopVenueItem[]; cityDistribution: any[]; facilitiesOverview: any }>('/statistics/venues');
  },

  /**
   * Get team performance analytics
   */
  async getTeamStatistics(teamId: string): Promise<any> {
    return apiFetch<any>(`/statistics/teams/${teamId}`);
  },
};
