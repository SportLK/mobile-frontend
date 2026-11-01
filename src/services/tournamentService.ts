import { apiRequest } from '../api';
import {
  Tournament,
  OrganizerWorkspaceResponse,
  BracketTreeResponse,
  TournamentRegistration,
  RegistrationStatus,
  RoleApplicationRecord,
} from '../types/tournament.types';
import { Match } from '../types/match.types';

export const tournamentService = {
  // ── 1. Organizer Application & Workspace ─────────────────────────────────
  async applyForOrganizer(
    token: string,
    payload: { organization: string; experience: string },
  ): Promise<any> {
    return apiRequest(
      '/role-applications',
      {
        method: 'POST',
        body: JSON.stringify({
          requestedRole: 'organizer',
          organization: payload.organization,
          experience: payload.experience,
        }),
      },
      token,
    );
  },

  async getMyApplications(token: string): Promise<RoleApplicationRecord[]> {
    return apiRequest<RoleApplicationRecord[]>('/role-applications/mine', {}, token);
  },

  async getOrganizerWorkspace(token: string): Promise<OrganizerWorkspaceResponse> {
    return apiRequest<OrganizerWorkspaceResponse>(
      '/tournaments/workspace/mine',
      {},
      token,
    );
  },

  // ── 2. Tournaments CRUD & Discovery ──────────────────────────────────────
  async getTournaments(params?: {
    sportType?: string;
    status?: string;
    city?: string;
    search?: string;
  }): Promise<Tournament[]> {
    const query = new URLSearchParams();
    if (params?.sportType) query.append('sportType', params.sportType);
    if (params?.status) query.append('status', params.status);
    if (params?.city) query.append('city', params.city);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Tournament[]>(`/tournaments${queryString}`);
  },

  async getTournamentDetails(id: string): Promise<Tournament> {
    return apiRequest<Tournament>(`/tournaments/${id}`);
  },

  async createTournament(
    token: string,
    data: {
      tournamentName: string;
      sportType: string;
      tournamentFormat?: string;
      maxParticipatingTeams?: number;
      minParticipatingTeams?: number;
      registrationFee?: number;
      prizePool?: string;
      startDate: string;
      endDate: string;
      registrationDeadline?: string;
      venueId?: string;
      city?: string;
      description?: string;
      rules?: string;
      bannerImageUrl?: string;
    },
  ): Promise<Tournament> {
    return apiRequest<Tournament>(
      '/tournaments',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  async updateTournament(
    token: string,
    id: string,
    data: Partial<Tournament>,
  ): Promise<Tournament> {
    return apiRequest<Tournament>(
      `/tournaments/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  // ── 3. Team Registrations ────────────────────────────────────────────────
  async registerTeam(
    token: string,
    tournamentId: string,
    teamId: string,
  ): Promise<TournamentRegistration> {
    return apiRequest<TournamentRegistration>(
      `/tournaments/${tournamentId}/register`,
      {
        method: 'POST',
        body: JSON.stringify({ teamId }),
      },
      token,
    );
  },

  async getTournamentRegistrations(
    tournamentId: string,
  ): Promise<TournamentRegistration[]> {
    return apiRequest<TournamentRegistration[]>(
      `/tournaments/${tournamentId}/registrations`,
    );
  },

  async updateRegistrationStatus(
    token: string,
    tournamentId: string,
    regId: string,
    status: RegistrationStatus,
  ): Promise<TournamentRegistration> {
    return apiRequest<TournamentRegistration>(
      `/tournaments/${tournamentId}/registrations/${regId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      token,
    );
  },

  // ── 4. Brackets, Schedules & Progression ────────────────────────────────
  async generateBracket(
    token: string,
    tournamentId: string,
    payload?: { seedRandomly?: boolean; venueId?: string },
  ): Promise<any> {
    return apiRequest(
      `/tournaments/${tournamentId}/generate-bracket`,
      {
        method: 'POST',
        body: JSON.stringify(payload || {}),
      },
      token,
    );
  },

  async getBracketTree(tournamentId: string): Promise<BracketTreeResponse> {
    return apiRequest<BracketTreeResponse>(`/tournaments/${tournamentId}/bracket`);
  },

  async advanceMatchWinner(
    token: string,
    tournamentId: string,
    bracketId: string,
    winnerTeamId: string,
  ): Promise<any> {
    return apiRequest(
      `/tournaments/${tournamentId}/bracket/${bracketId}/winner`,
      {
        method: 'PATCH',
        body: JSON.stringify({ winnerTeamId }),
      },
      token,
    );
  },

  async getTournamentSchedules(tournamentId: string): Promise<Match[]> {
    return apiRequest<Match[]>(`/tournaments/${tournamentId}/schedules`);
  },

  async seedDemoData(): Promise<any> {
    return apiRequest('/tournaments/seed-demo', { method: 'POST' });
  },
};

