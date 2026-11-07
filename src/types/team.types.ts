export type SportType = 'CRICKET' | 'FOOTBALL' | 'BADMINTON' | 'BASKETBALL' | 'VOLLEYBALL';

export type TeamMemberRole = 'CAPTAIN' | 'VICE_CAPTAIN' | 'SQUAD_PLAYER';

export type TeamStatus = 'ACTIVE' | 'SUSPENDED' | 'DISBANDED';

export type InvitationType = 'MANAGER_TO_PLAYER' | 'PLAYER_REQUEST_TO_JOIN';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export type ChallengeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  memberRole: TeamMemberRole;
  jerseyNumber?: number | null;
  joinedAt?: string;
  user?: {
    id: string;
    displayName: string;
    email: string;
  };
}

export interface Team {
  id: string;
  managerId: string;
  teamName: string;
  sportType: SportType;
  logoUrl?: string | null;
  teamBio?: string | null;
  primaryLocationCity?: string | null;
  status: TeamStatus;
  createdAt: string;
  manager?: {
    id: string;
    displayName: string;
    email: string;
  };
  members?: TeamMember[];
  playersCount?: number;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  invitedUserId: string;
  inviteType: InvitationType;
  status: InvitationStatus;
  createdAt: string;
  team?: Team;
  invitedUser?: {
    id: string;
    displayName: string;
    email: string;
  };
}

export interface TeamChallenge {
  id: string;
  challengerTeamId: string;
  challengedTeamId: string;
  venueId?: string | null;
  proposedMatchDate: string;
  sportType: SportType;
  status: ChallengeStatus;
  createdAt: string;
  venueName?: string;
  challengerTeam?: Team;
  challengedTeam?: Team;
}

export interface CreateTeamPayload {
  managerId: string;
  teamName: string;
  sportType: SportType;
  primaryLocationCity?: string;
  teamBio?: string;
  logoUrl?: string;
}

export interface UpdateTeamPayload {
  teamName?: string;
  teamBio?: string;
  primaryLocationCity?: string;
  logoUrl?: string;
  status?: TeamStatus;
}

export interface AddMemberPayload {
  userId: string;
  memberRole?: TeamMemberRole;
  jerseyNumber?: number;
}

export interface UpdateMemberRolePayload {
  memberRole?: TeamMemberRole;
  jerseyNumber?: number;
}

export interface CreateChallengePayload {
  challengedTeamId: string;
  sportType: SportType;
  proposedMatchDate: string;
  venueId?: string;
}

