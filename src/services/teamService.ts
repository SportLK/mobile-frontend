import { apiRequest } from '../api';
import {
  Team,
  TeamMember,
  TeamInvitation,
  TeamChallenge,
  CreateTeamPayload,
  UpdateTeamPayload,
  AddMemberPayload,
  UpdateMemberRolePayload,
  CreateChallengePayload,
  ChallengeStatus,
} from '../types/team.types';

export const teamService = {
  // ── 1. Teams Management & Search ──────────────────────────────────────────
  async getTeams(params?: { sportType?: string; city?: string; search?: string }): Promise<Team[]> {
    const query = new URLSearchParams();
    if (params?.sportType && params.sportType !== 'All') query.append('sportType', params.sportType.toUpperCase());
    if (params?.city) query.append('city', params.city);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Team[]>(`/teams${qs}`);
  },

  async getTeamById(id: string): Promise<Team> {
    return apiRequest<Team>(`/teams/${id}`);
  },

  async getTeamsByManager(managerId: string, token?: string): Promise<Team[]> {
    return apiRequest<Team[]>(`/teams/manager/${managerId}`, {}, token);
  },

  async createTeam(payload: CreateTeamPayload, token?: string): Promise<Team> {
    return apiRequest<Team>(
      '/teams',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async updateTeam(id: string, payload: UpdateTeamPayload, token?: string): Promise<Team> {
    return apiRequest<Team>(
      `/teams/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  // ── 2. Squad & Roster Management ──────────────────────────────────────────
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return apiRequest<TeamMember[]>(`/teams/${teamId}/members`);
  },

  async addTeamMember(teamId: string, payload: AddMemberPayload, token?: string): Promise<TeamMember> {
    return apiRequest<TeamMember>(
      `/teams/${teamId}/members`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async updateMemberRole(
    teamId: string,
    memberId: string,
    payload: UpdateMemberRolePayload,
    token?: string,
  ): Promise<TeamMember> {
    return apiRequest<TeamMember>(
      `/teams/${teamId}/members/${memberId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async removeTeamMember(
    teamId: string,
    memberId: string,
    token?: string,
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(
      `/teams/${teamId}/members/${memberId}`,
      {
        method: 'DELETE',
      },
      token,
    );
  },

  // ── 3. Join Requests (Player -> Team) ─────────────────────────────────────
  async getJoinRequests(teamId: string, token?: string): Promise<TeamInvitation[]> {
    return apiRequest<TeamInvitation[]>(`/teams/${teamId}/join-requests`, {}, token);
  },

  async createJoinRequest(teamId: string, userId: string, token?: string): Promise<TeamInvitation> {
    return apiRequest<TeamInvitation>(
      `/teams/${teamId}/join-requests`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      },
      token,
    );
  },

  async acceptJoinRequest(
    teamId: string,
    requestId: string,
    token?: string,
  ): Promise<{ success: boolean; member: TeamMember }> {
    return apiRequest<{ success: boolean; member: TeamMember }>(
      `/teams/${teamId}/join-requests/${requestId}/accept`,
      {
        method: 'POST',
      },
      token,
    );
  },

  async rejectJoinRequest(
    teamId: string,
    requestId: string,
    token?: string,
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(
      `/teams/${teamId}/join-requests/${requestId}/reject`,
      {
        method: 'POST',
      },
      token,
    );
  },

  // ── 4. Invitations (Manager -> Player) ────────────────────────────────────
  async getTeamInvitations(teamId: string, token?: string): Promise<TeamInvitation[]> {
    return apiRequest<TeamInvitation[]>(`/teams/${teamId}/invitations`, {}, token);
  },

  async createInvitation(teamId: string, invitedUserId: string, token?: string): Promise<TeamInvitation> {
    return apiRequest<TeamInvitation>(
      `/teams/${teamId}/invitations`,
      {
        method: 'POST',
        body: JSON.stringify({ invitedUserId }),
      },
      token,
    );
  },

  async cancelInvitation(
    teamId: string,
    invitationId: string,
    token?: string,
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(
      `/teams/${teamId}/invitations/${invitationId}`,
      {
        method: 'DELETE',
      },
      token,
    );
  },

  // ── 5. Team Challenges & Responses ────────────────────────────────────────
  async createChallenge(
    challengerTeamId: string,
    payload: CreateChallengePayload,
    token?: string,
  ): Promise<TeamChallenge> {
    return apiRequest<TeamChallenge>(
      `/teams/${challengerTeamId}/challenges`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async getReceivedChallenges(teamId: string, token?: string): Promise<TeamChallenge[]> {
    return apiRequest<TeamChallenge[]>(`/teams/${teamId}/challenges/received`, {}, token);
  },

  async getSentChallenges(teamId: string, token?: string): Promise<TeamChallenge[]> {
    return apiRequest<TeamChallenge[]>(`/teams/${teamId}/challenges/sent`, {}, token);
  },

  async getOpenChallenges(): Promise<TeamChallenge[]> {
    return apiRequest<TeamChallenge[]>('/teams/challenges/open');
  },

  async respondToChallenge(
    teamId: string,
    challengeId: string,
    status: 'ACCEPTED' | 'DECLINED',
    token?: string,
  ): Promise<TeamChallenge> {
    return apiRequest<TeamChallenge>(
      `/teams/${teamId}/challenges/${challengeId}/respond`,
      {
        method: 'POST',
        body: JSON.stringify({ status }),
      },
      token,
    );
  },
};

