import { Venue } from './venue.types';
import { Match } from './match.types';

export type SportType = 'CRICKET' | 'FOOTBALL' | 'BADMINTON' | 'BASKETBALL' | 'VOLLEYBALL';

export type TournamentFormat = 'KNOCKOUT_SINGLE' | 'ROUND_ROBIN' | 'GROUP_AND_KNOCKOUT';

export type TournamentStatus =
  | 'DRAFT'
  | 'OPEN_FOR_REGISTRATION'
  | 'REGISTRATION_CLOSED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type RegistrationStatus = 'PAYMENT_PENDING' | 'CONFIRMED' | 'DISQUALIFIED';

export interface TournamentTeam {
  id: string;
  teamName: string;
  logoUrl?: string | null;
  city?: string;
  manager?: {
    id: string;
    fullName?: string;
    displayName?: string;
    email: string;
  };
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  teamId: string;
  team: TournamentTeam;
  registrationStatus: RegistrationStatus;
  registeredAt: string;
}

export interface TournamentBracketNode {
  bracketId: string;
  sequence: number;
  nextBracketId: string | null;
  team1: { id: string; name: string; logo?: string | null } | null;
  team2: { id: string; name: string; logo?: string | null } | null;
  winner: { id: string; name: string } | null;
  match?: Match | null;
}

export interface BracketRound {
  roundNumber: number;
  roundName: string;
  matches: TournamentBracketNode[];
}

export interface BracketTreeResponse {
  tournamentId: string;
  rounds: BracketRound[];
}

export interface Tournament {
  id: string;
  tournamentName: string;
  sportType: SportType;
  tournamentFormat: TournamentFormat;
  minParticipatingTeams: number;
  maxParticipatingTeams: number;
  registrationFee: number;
  prizePool?: string | null;
  startDate: string;
  endDate: string;
  registrationDeadline?: string | null;
  tournamentStatus: TournamentStatus;
  organizerId: string;
  organizer?: {
    id: string;
    fullName?: string;
    displayName?: string;
    email: string;
  };
  venueId?: string | null;
  venue?: Venue | null;
  city?: string | null;
  description?: string | null;
  rules?: string | null;
  bannerImageUrl?: string | null;
  confirmedTeamsCount?: number;
  registrations?: TournamentRegistration[];
  matches?: Match[];
  createdAt: string;
}

export interface OrganizerWorkspaceStats {
  totalTournaments: number;
  ongoingTournaments: number;
  openTournaments: number;
  completedTournaments: number;
  totalRegistrations: number;
}

export interface OrganizerWorkspaceResponse {
  stats: OrganizerWorkspaceStats;
  tournaments: Tournament[];
}

export interface OrganizerApplicationPayload {
  requestedRole: 'organizer';
  organization: string;
  experience: string;
}

export interface RoleApplicationRecord {
  id: string;
  userId: string;
  requestedRole: 'TEAM_MANAGER' | 'TOURNAMENT_ORGANIZER';
  justificationNotes?: string;
  organization?: string;
  experience?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string | null;
  createdAt: string;
}

