export type SportType = 'CRICKET' | 'FUTSAL' | 'BADMINTON' | 'BASKETBALL';

export interface VenueFacility {
  id: string;
  venueId: string;
  sportType: SportType;
  courtOrPitchCount: number;
  hasFloodlights: boolean;
  hasParking: boolean;
  hasChangingRooms: boolean;
}

export interface Venue {
  id: string;
  venueName: string;
  addressLine: string;
  city: string;
  district?: string;
  province?: string;
  contactPhone?: string;
  hourlyBaseRate: number;
  isActive: boolean;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  distanceMeters?: number;
  facilities: VenueFacility[];
  imageUrl?: string;
}

export interface NearbyVenuesQuery {
  latitude: number;
  longitude: number;
  radiusInKm?: number;
  sportType?: SportType;
  city?: string;
}
