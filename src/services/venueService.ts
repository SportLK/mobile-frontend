import { apiFetch } from './api';
import { Venue, NearbyVenuesQuery } from '../types/venue.types';

export const venueService = {
  /**
   * Search nearby sports grounds with GPS radius & sport filters
   */
  async getNearbyVenues(query: NearbyVenuesQuery): Promise<Venue[]> {
    const params = new URLSearchParams({
      latitude: query.latitude.toString(),
      longitude: query.longitude.toString(),
      radiusInKm: (query.radiusInKm || 15).toString(),
    });

    if (query.sportType) {
      params.append('sportType', query.sportType);
    }
    if (query.city) {
      params.append('city', query.city);
    }

    return apiFetch<Venue[]>(`/venues/nearby?${params.toString()}`);
  },

  /**
   * Get all active venues (for catalog / organizer selection)
   */
  async getAllVenues(sportType?: string, city?: string): Promise<Venue[]> {
    const params = new URLSearchParams();
    if (sportType) params.append('sportType', sportType);
    if (city) params.append('city', city);

    const queryString = params.toString();
    return apiFetch<Venue[]>(`/venues${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get single venue details by ID
   */
  async getVenueById(id: string): Promise<Venue> {
    return apiFetch<Venue>(`/venues/${id}`);
  },
};
