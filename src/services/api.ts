import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Automatically detect host IP (works on physical phone over Wi-Fi, Android emulator, and iOS/web)
const getHostAddress = (): string => {
  try {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest?.debuggerHost || (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch {
    // fallback
  }

  // Fallback to Wi-Fi IP if known, or 10.0.2.2 for Android emulator
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const DEFAULT_HOST = getHostAddress();
export const API_BASE_URL = `http://${DEFAULT_HOST}:3000/api/v1`;


class ApiService {
  private baseUrl = API_BASE_URL;

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // ----------------------------------------------------
  // Teams API
  // ----------------------------------------------------
  getTeams(params?: { sportType?: string; city?: string; search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<any[]>(`/teams${query ? `?${query}` : ''}`);
  }

  getTeamsByManager(managerId: string) {
    return this.request<any[]>(`/teams/manager/${managerId}`);
  }

  getTeamById(id: string) {
    return this.request<any>(`/teams/${id}`);
  }

  createTeam(data: {
    managerId: string;
    teamName: string;
    sportType: string;
    primaryLocationCity?: string;
    teamBio?: string;
    logoUrl?: string;
  }) {
    return this.request<any>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateTeam(id: string, data: any) {
    return this.request<any>(`/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ----------------------------------------------------
  // Squad Roster API
  // ----------------------------------------------------
  getTeamMembers(teamId: string) {
    return this.request<any[]>(`/teams/${teamId}/members`);
  }

  addTeamMember(teamId: string, data: { userId: string; memberRole?: string; jerseyNumber?: number }) {
    return this.request<any>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateMemberRole(teamId: string, memberId: string, data: { memberRole?: string; jerseyNumber?: number }) {
    return this.request<any>(`/teams/${teamId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  removeTeamMember(teamId: string, memberId: string) {
    return this.request<any>(`/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // ----------------------------------------------------
  // Join Requests API
  // ----------------------------------------------------
  getJoinRequests(teamId: string) {
    return this.request<any[]>(`/teams/${teamId}/join-requests`);
  }

  createJoinRequest(teamId: string, data: { userId: string }) {
    return this.request<any>(`/teams/${teamId}/join-requests`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  acceptJoinRequest(teamId: string, requestId: string) {
    return this.request<any>(`/teams/${teamId}/join-requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  rejectJoinRequest(teamId: string, requestId: string) {
    return this.request<any>(`/teams/${teamId}/join-requests/${requestId}/reject`, {
      method: 'POST',
    });
  }

  // ----------------------------------------------------
  // Invitations API
  // ----------------------------------------------------
  getTeamInvitations(teamId: string) {
    return this.request<any[]>(`/teams/${teamId}/invitations`);
  }

  createInvitation(teamId: string, data: { invitedUserId: string }) {
    return this.request<any>(`/teams/${teamId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  cancelInvitation(teamId: string, invitationId: string) {
    return this.request<any>(`/teams/${teamId}/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  }

  // ----------------------------------------------------
  // Challenges & Responses API
  // ----------------------------------------------------
  createChallenge(teamId: string, data: {
    challengedTeamId: string;
    sportType: string;
    proposedMatchDate: string;
    venueId?: string;
  }) {
    return this.request<any>(`/teams/${teamId}/challenges`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getReceivedChallenges(teamId: string) {
    return this.request<any[]>(`/teams/${teamId}/challenges/received`);
  }

  getSentChallenges(teamId: string) {
    return this.request<any[]>(`/teams/${teamId}/challenges/sent`);
  }

  getOpenChallenges() {
    return this.request<any[]>('/teams/challenges/open');
  }

  respondToChallenge(teamId: string, challengeId: string, status: 'ACCEPTED' | 'DECLINED') {
    return this.request<any>(`/teams/${teamId}/challenges/${challengeId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // ----------------------------------------------------
  // Seed Demo Data API
  // ----------------------------------------------------
  seedDemoData() {
    return this.request<any>('/teams/seed', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
