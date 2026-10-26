import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../services/api';

export interface SquadMember {
  id: string;
  name: string;
  role: 'Captain' | 'Vice-Captain' | 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper' | 'Squad Player';
  initials: string;
  jerseyNumber?: number;
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

export interface JoinRequest {
  id: string;
  name: string;
  sportLevel: string;
  initials: string;
  requestedDate: string;
  message?: string;
}

export interface TeamInvitation {
  id: string;
  playerName: string;
  role: string;
  jerseyNumber?: number;
  status: 'Pending' | 'Accepted' | 'Declined';
  sentDate: string;
}

export interface Challenge {
  id: string;
  type: 'Team challenge' | 'Individual challenge';
  challengerTeam: string;
  challengedTeam: string;
  sport: string;
  dateVenue: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  direction: 'received' | 'sent' | 'open';
}

export interface TeamProfile {
  id: string;
  name: string;
  sport: 'Futsal' | 'Cricket' | 'Badminton' | 'Basketball';
  location: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  bio: string;
  initials: string;
  playersCount: number;
  matchesCount: number;
  winsCount: number;
  status: 'Active team' | 'Inactive';
}

interface TeamContextType {
  teams: TeamProfile[];
  activeTeam: TeamProfile;
  squad: SquadMember[];
  joinRequests: JoinRequest[];
  invitations: TeamInvitation[];
  challenges: Challenge[];
  isLoading: boolean;
  refreshFromBackend: () => Promise<void>;
  
  // Team Management
  switchActiveTeam: (teamId: string) => void;
  createTeam: (teamData: { name: string; sport: TeamProfile['sport']; location: string; level: TeamProfile['level']; bio: string }) => void;
  updateTeam: (data: Partial<TeamProfile>) => void;
  
  // Squad Roster Management
  addSquadMember: (name: string, role: SquadMember['role'], jersey?: number) => void;
  removeSquadMember: (id: string) => void;
  updateSquadMemberRole: (id: string, role: SquadMember['role'], jersey?: number) => void;
  
  // Join Requests
  acceptJoinRequest: (id: string) => void;
  rejectJoinRequest: (id: string) => void;
  
  // Invitations
  sendInvitation: (playerName: string, role: string, jersey?: number) => void;
  cancelInvitation: (id: string) => void;
  
  // Challenges & Responses
  createChallenge: (opponentTeam: string, sport: string, dateVenue: string) => void;
  acceptChallenge: (id: string) => void;
  declineChallenge: (id: string) => void;
}

const INITIAL_TEAMS: TeamProfile[] = [
  {
    id: '1',
    name: 'Colombo Strikers',
    sport: 'Futsal',
    location: 'Colombo',
    level: 'Intermediate',
    bio: 'A Colombo-based squad united by a love for futsal. Training every Sunday at Colombo Sports Arena.',
    initials: 'CS',
    playersCount: 12,
    matchesCount: 18,
    winsCount: 12,
    status: 'Active team',
  },
  {
    id: '2',
    name: 'Kandy United',
    sport: 'Cricket',
    location: 'Kandy',
    level: 'Advanced',
    bio: 'Central Province futsal champions 2025.',
    initials: 'KU',
    playersCount: 15,
    matchesCount: 22,
    winsCount: 16,
    status: 'Active team',
  },
];

const INITIAL_SQUAD: SquadMember[] = [
  {
    id: 'sq-1',
    name: 'Dasun Praveena',
    role: 'Captain',
    initials: 'DP',
    jerseyNumber: 7,
    status: 'Active',
    joinedDate: 'Jan 2026',
  },
  {
    id: 'sq-2',
    name: 'Kavindu Perera',
    role: 'Forward',
    initials: 'KP',
    jerseyNumber: 10,
    status: 'Active',
    joinedDate: 'Feb 2026',
  },
  {
    id: 'sq-3',
    name: 'Chamath Silva',
    role: 'Goalkeeper',
    initials: 'CS',
    jerseyNumber: 1,
    status: 'Active',
    joinedDate: 'Mar 2026',
  },
  {
    id: 'sq-4',
    name: 'Malith Bandara',
    role: 'Vice-Captain',
    initials: 'MB',
    jerseyNumber: 8,
    status: 'Active',
    joinedDate: 'Mar 2026',
  },
  {
    id: 'sq-5',
    name: 'Ravindu Fernando',
    role: 'Defender',
    initials: 'RF',
    jerseyNumber: 4,
    status: 'Active',
    joinedDate: 'Apr 2026',
  },
];

const INITIAL_JOIN_REQUESTS: JoinRequest[] = [
  {
    id: 'req-1',
    name: 'Sahan Wickramasinghe',
    sportLevel: 'Futsal · Intermediate',
    initials: 'SW',
    requestedDate: 'Yesterday',
    message: 'Experienced forward looking for regular Sunday league games.',
  },
  {
    id: 'req-2',
    name: 'Dilshan Fernando',
    sportLevel: 'Futsal · Intermediate',
    initials: 'DF',
    requestedDate: '2 days ago',
    message: 'Play midfield/defender. Played in district schools tournament.',
  },
];

const INITIAL_INVITATIONS: TeamInvitation[] = [
  {
    id: 'inv-1',
    playerName: 'Nuwan Pradeep',
    role: 'Defender',
    jerseyNumber: 5,
    status: 'Pending',
    sentDate: '12 Oct 2026',
  },
  {
    id: 'inv-2',
    playerName: 'Ashen Bandara',
    role: 'Midfielder',
    jerseyNumber: 11,
    status: 'Pending',
    sentDate: '14 Oct 2026',
  },
];

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    type: 'Team challenge',
    challengerTeam: 'Kandy United',
    challengedTeam: 'Colombo Strikers',
    sport: 'Futsal · Intermediate',
    dateVenue: '10 Oct · 5:00 PM · Colombo Sports Arena',
    status: 'Pending',
    direction: 'received',
  },
  {
    id: 'ch-2',
    type: 'Team challenge',
    challengerTeam: 'Galle Titans',
    challengedTeam: 'Colombo Strikers',
    sport: 'Futsal · Intermediate',
    dateVenue: '15 Oct · 6:30 PM · Galle Indoor Complex',
    status: 'Pending',
    direction: 'received',
  },
  {
    id: 'ch-3',
    type: 'Team challenge',
    challengerTeam: 'Colombo Strikers',
    challengedTeam: 'Negombo Kings',
    sport: 'Futsal · Intermediate',
    dateVenue: '22 Oct · 4:00 PM · Negombo Arena',
    status: 'Pending',
    direction: 'sent',
  },
  {
    id: 'ch-4',
    type: 'Individual challenge',
    challengerTeam: 'Nimal Jayasinghe',
    challengedTeam: 'Open Opponent',
    sport: 'Badminton · Beginner',
    dateVenue: '11 Oct · 8:00 AM · Colombo Sports Arena',
    status: 'Pending',
    direction: 'open',
  },
  {
    id: 'ch-5',
    type: 'Team challenge',
    challengerTeam: 'Moratuwa Ballers',
    challengedTeam: 'Open Opponent',
    sport: 'Futsal · Intermediate',
    dateVenue: '25 Oct · 7:00 PM · Moratuwa Arena',
    status: 'Pending',
    direction: 'open',
  },
];

// Mapper Helpers
const mapBackendTeam = (t: any): TeamProfile => ({
  id: String(t.id),
  name: t.teamName || 'Unnamed Team',
  sport: (t.sportType ? t.sportType.charAt(0) + t.sportType.slice(1).toLowerCase() : 'Futsal') as any,
  location: t.primaryLocationCity || 'Colombo',
  level: 'Intermediate',
  bio: t.teamBio || '',
  initials: t.teamName ? t.teamName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'TM',
  playersCount: t.playersCount || (t.members ? t.members.length : 1),
  matchesCount: 18,
  winsCount: 12,
  status: t.status === 'ACTIVE' ? 'Active team' : 'Inactive',
});

const mapBackendMember = (m: any): SquadMember => {
  const roleNameMap: Record<string, SquadMember['role']> = {
    CAPTAIN: 'Captain',
    VICE_CAPTAIN: 'Vice-Captain',
    FORWARD: 'Forward',
    MIDFIELDER: 'Midfielder',
    DEFENDER: 'Defender',
    GOALKEEPER: 'Goalkeeper',
    SQUAD_PLAYER: 'Squad Player',
  };
  const fullName = m.user?.fullName || m.name || `Player ${m.userId || m.id}`;
  const initials = fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  return {
    id: String(m.id),
    name: fullName,
    role: roleNameMap[m.memberRole] || 'Squad Player',
    initials: initials || 'PL',
    jerseyNumber: m.jerseyNumber,
    status: 'Active',
    joinedDate: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Oct 2026',
  };
};

const mapBackendJoinRequest = (r: any): JoinRequest => {
  const name = r.invitedUser?.fullName || `User #${r.invitedUserId}`;
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  return {
    id: String(r.id),
    name,
    sportLevel: 'Futsal · Intermediate',
    initials: initials || 'JR',
    requestedDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
    message: r.notes || 'Looking to join squad.',
  };
};

const mapBackendInvitation = (inv: any): TeamInvitation => {
  const playerName = inv.invitedUser?.fullName || `Player #${inv.invitedUserId}`;
  return {
    id: String(inv.id),
    playerName,
    role: 'Squad Player',
    jerseyNumber: undefined,
    status: inv.status === 'ACCEPTED' ? 'Accepted' : inv.status === 'DECLINED' ? 'Declined' : 'Pending',
    sentDate: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'Recent',
  };
};

const mapBackendChallenge = (c: any, direction: 'received' | 'sent' | 'open'): Challenge => {
  return {
    id: String(c.id),
    type: 'Team challenge',
    challengerTeam: c.challengerTeam?.teamName || `Team #${c.challengerTeamId}`,
    challengedTeam: c.challengedTeam?.teamName || (c.challengedTeamId ? `Team #${c.challengedTeamId}` : 'Open Opponent'),
    sport: `${c.sportType ? c.sportType.charAt(0) + c.sportType.slice(1).toLowerCase() : 'Futsal'} · Intermediate`,
    dateVenue: c.proposedMatchDate ? new Date(c.proposedMatchDate).toLocaleDateString() : 'Upcoming',
    status: c.status === 'ACCEPTED' ? 'Accepted' : c.status === 'DECLINED' ? 'Declined' : 'Pending',
    direction,
  };
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<TeamProfile[]>(INITIAL_TEAMS);
  const [activeTeam, setActiveTeam] = useState<TeamProfile>(INITIAL_TEAMS[0]);
  const [squad, setSquad] = useState<SquadMember[]>(INITIAL_SQUAD);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(INITIAL_JOIN_REQUESTS);
  const [invitations, setInvitations] = useState<TeamInvitation[]>(INITIAL_INVITATIONS);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync data with live NestJS backend
  const refreshFromBackend = useCallback(async (targetTeamId?: string) => {
    const currentTeamId = targetTeamId || activeTeam.id;
    try {
      setIsLoading(true);
      const backendTeams = await api.getTeams();
      if (backendTeams && Array.isArray(backendTeams) && backendTeams.length > 0) {
        const mappedTeams = backendTeams.map(mapBackendTeam);
        setTeams(mappedTeams);
        const currentActive = mappedTeams.find((t) => t.id === currentTeamId) || mappedTeams[0];
        setActiveTeam(currentActive);
      }

      // Fetch squad members for active team
      const members = await api.getTeamMembers(currentTeamId);
      if (members && Array.isArray(members) && members.length > 0) {
        setSquad(members.map(mapBackendMember));
      }

      // Fetch join requests
      const requests = await api.getJoinRequests(currentTeamId);
      if (requests && Array.isArray(requests) && requests.length > 0) {
        setJoinRequests(requests.map(mapBackendJoinRequest));
      }

      // Fetch invitations
      const invs = await api.getTeamInvitations(currentTeamId);
      if (invs && Array.isArray(invs) && invs.length > 0) {
        setInvitations(invs.map(mapBackendInvitation));
      }

      // Fetch challenges
      const [received, sent, open] = await Promise.allSettled([
        api.getReceivedChallenges(currentTeamId),
        api.getSentChallenges(currentTeamId),
        api.getOpenChallenges(),
      ]);

      const mappedChallenges: Challenge[] = [];
      if (received.status === 'fulfilled' && Array.isArray(received.value)) {
        mappedChallenges.push(...received.value.map((c: any) => mapBackendChallenge(c, 'received')));
      }
      if (sent.status === 'fulfilled' && Array.isArray(sent.value)) {
        mappedChallenges.push(...sent.value.map((c: any) => mapBackendChallenge(c, 'sent')));
      }
      if (open.status === 'fulfilled' && Array.isArray(open.value)) {
        mappedChallenges.push(...open.value.map((c: any) => mapBackendChallenge(c, 'open')));
      }

      if (mappedChallenges.length > 0) {
        setChallenges(mappedChallenges);
      }
    } catch {
      // If offline or backend unreachable, fallback data remains active
    } finally {
      setIsLoading(false);
    }
  }, [activeTeam.id]);

  useEffect(() => {
    refreshFromBackend();
  }, []);

  // Switch Active Team
  const switchActiveTeam = (teamId: string) => {
    const selected = teams.find((t) => t.id === teamId);
    if (selected) {
      setActiveTeam(selected);
      refreshFromBackend(teamId);
    }
  };

  // Create Team
  const createTeam = async (teamData: {
    name: string;
    sport: TeamProfile['sport'];
    location: string;
    level: TeamProfile['level'];
    bio: string;
  }) => {
    const initials = teamData.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const tempId = `team-${Date.now()}`;
    const newTeam: TeamProfile = {
      id: tempId,
      name: teamData.name,
      sport: teamData.sport,
      location: teamData.location,
      level: teamData.level,
      bio: teamData.bio || `A ${teamData.location}-based ${teamData.sport.toLowerCase()} squad.`,
      initials: initials || 'TM',
      playersCount: 1,
      matchesCount: 0,
      winsCount: 0,
      status: 'Active team',
    };

    setTeams((prev) => [...prev, newTeam]);
    setActiveTeam(newTeam);

    try {
      const res = await api.createTeam({
        managerId: '1',
        teamName: teamData.name,
        sportType: teamData.sport.toUpperCase(),
        primaryLocationCity: teamData.location,
        teamBio: teamData.bio,
      });
      if (res && res.id) {
        const realId = String(res.id);
        setTeams((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: realId } : t)));
        setActiveTeam((prev) => (prev.id === tempId ? { ...prev, id: realId } : prev));
      }
    } catch {
      // Fallback kept
    }
  };

  // Update Active Team Profile
  const updateTeam = async (data: Partial<TeamProfile>) => {
    setActiveTeam((prev) => {
      const updated = { ...prev, ...data };
      setTeams((all) => all.map((t) => (t.id === prev.id ? updated : t)));
      return updated;
    });

    try {
      await api.updateTeam(activeTeam.id, {
        teamName: data.name,
        teamBio: data.bio,
        primaryLocationCity: data.location,
      });
    } catch {
      // Local state already updated
    }
  };

  // Squad Member Management
  const addSquadMember = (name: string, role: SquadMember['role'], jersey?: number) => {
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newMember: SquadMember = {
      id: `sq-${Date.now()}`,
      name,
      role: role || 'Squad Player',
      initials: initials || 'PL',
      jerseyNumber: jersey,
      status: 'Active',
      joinedDate: 'Oct 2026',
    };

    setSquad((prev) => [...prev, newMember]);
    updateTeam({ playersCount: activeTeam.playersCount + 1 });
  };

  const removeSquadMember = async (id: string) => {
    setSquad((prev) => prev.filter((m) => m.id !== id));
    updateTeam({ playersCount: Math.max(1, activeTeam.playersCount - 1) });
    try {
      await api.removeTeamMember(activeTeam.id, id);
    } catch {
      // Local state already updated
    }
  };

  const updateSquadMemberRole = async (id: string, role: SquadMember['role'], jersey?: number) => {
    setSquad((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, role, jerseyNumber: jersey !== undefined ? jersey : m.jerseyNumber } : m
      )
    );
    try {
      const roleEnumMap: Record<string, string> = {
        Captain: 'CAPTAIN',
        'Vice-Captain': 'VICE_CAPTAIN',
        Forward: 'FORWARD',
        Midfielder: 'MIDFIELDER',
        Defender: 'DEFENDER',
        Goalkeeper: 'GOALKEEPER',
        'Squad Player': 'SQUAD_PLAYER',
      };
      await api.updateMemberRole(activeTeam.id, id, {
        memberRole: roleEnumMap[role] || 'SQUAD_PLAYER',
        jerseyNumber: jersey,
      });
    } catch {
      // Local state already updated
    }
  };

  // Join Requests
  const acceptJoinRequest = async (id: string) => {
    const req = joinRequests.find((r) => r.id === id);
    if (!req) return;

    addSquadMember(req.name, 'Squad Player');
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));

    try {
      await api.acceptJoinRequest(activeTeam.id, id);
    } catch {
      // Local state already updated
    }
  };

  const rejectJoinRequest = async (id: string) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await api.rejectJoinRequest(activeTeam.id, id);
    } catch {
      // Local state already updated
    }
  };

  // Invitations
  const sendInvitation = async (playerName: string, role: string, jersey?: number) => {
    const newInv: TeamInvitation = {
      id: `inv-${Date.now()}`,
      playerName,
      role,
      jerseyNumber: jersey,
      status: 'Pending',
      sentDate: 'Just now',
    };
    setInvitations((prev) => [newInv, ...prev]);

    try {
      await api.createInvitation(activeTeam.id, { invitedUserId: '2' });
    } catch {
      // Local state already updated
    }
  };

  const cancelInvitation = async (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
    try {
      await api.cancelInvitation(activeTeam.id, id);
    } catch {
      // Local state already updated
    }
  };

  // Challenges & Challenge Responses
  const createChallenge = async (opponentTeam: string, sport: string, dateVenue: string) => {
    const newChallenge: Challenge = {
      id: `ch-sent-${Date.now()}`,
      type: 'Team challenge',
      challengerTeam: activeTeam.name,
      challengedTeam: opponentTeam,
      sport,
      dateVenue,
      status: 'Pending',
      direction: 'sent',
    };
    setChallenges((prev) => [newChallenge, ...prev]);

    try {
      await api.createChallenge(activeTeam.id, {
        challengedTeamId: '2',
        sportType: sport.toUpperCase().includes('FUTSAL') ? 'FUTSAL' : 'CRICKET',
        proposedMatchDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      });
    } catch {
      // Local state already updated
    }
  };

  const acceptChallenge = async (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Accepted' } : c))
    );
    try {
      await api.respondToChallenge(activeTeam.id, id, 'ACCEPTED');
    } catch {
      // Local state already updated
    }
  };

  const declineChallenge = async (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Declined' } : c))
    );
    try {
      await api.respondToChallenge(activeTeam.id, id, 'DECLINED');
    } catch {
      // Local state already updated
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        activeTeam,
        squad,
        joinRequests,
        invitations,
        challenges,
        isLoading,
        refreshFromBackend,
        switchActiveTeam,
        createTeam,
        updateTeam,
        addSquadMember,
        removeSquadMember,
        updateSquadMemberRole,
        acceptJoinRequest,
        rejectJoinRequest,
        sendInvitation,
        cancelInvitation,
        createChallenge,
        acceptChallenge,
        declineChallenge,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeamContext must be used within a TeamProvider');
  }
  return context;
};

