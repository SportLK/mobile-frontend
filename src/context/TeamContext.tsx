import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    id: 'team-1',
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
    id: 'team-2',
    name: 'Colombo Kings',
    sport: 'Cricket',
    location: 'Colombo',
    level: 'Advanced',
    bio: 'Corporate weekend 10-overs cricket squad playing in the Western Province Premier League.',
    initials: 'CK',
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
  // Received
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
  // Sent
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
  // Open / Browse
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

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<TeamProfile[]>(INITIAL_TEAMS);
  const [activeTeam, setActiveTeam] = useState<TeamProfile>(INITIAL_TEAMS[0]);
  const [squad, setSquad] = useState<SquadMember[]>(INITIAL_SQUAD);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(INITIAL_JOIN_REQUESTS);
  const [invitations, setInvitations] = useState<TeamInvitation[]>(INITIAL_INVITATIONS);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);

  // Switch Active Team
  const switchActiveTeam = (teamId: string) => {
    const selected = teams.find((t) => t.id === teamId);
    if (selected) {
      setActiveTeam(selected);
    }
  };

  // Create Team
  const createTeam = (teamData: {
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

    const newTeam: TeamProfile = {
      id: `team-${Date.now()}`,
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
  };

  // Update Active Team Profile
  const updateTeam = (data: Partial<TeamProfile>) => {
    setActiveTeam((prev) => {
      const updated = { ...prev, ...data };
      setTeams((all) => all.map((t) => (t.id === prev.id ? updated : t)));
      return updated;
    });
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

  const removeSquadMember = (id: string) => {
    setSquad((prev) => prev.filter((m) => m.id !== id));
    updateTeam({ playersCount: Math.max(1, activeTeam.playersCount - 1) });
  };

  const updateSquadMemberRole = (id: string, role: SquadMember['role'], jersey?: number) => {
    setSquad((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, role, jerseyNumber: jersey !== undefined ? jersey : m.jerseyNumber } : m
      )
    );
  };

  // Join Requests
  const acceptJoinRequest = (id: string) => {
    const req = joinRequests.find((r) => r.id === id);
    if (!req) return;

    addSquadMember(req.name, 'Squad Player');
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const rejectJoinRequest = (id: string) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
  };

  // Invitations
  const sendInvitation = (playerName: string, role: string, jersey?: number) => {
    const newInv: TeamInvitation = {
      id: `inv-${Date.now()}`,
      playerName,
      role,
      jerseyNumber: jersey,
      status: 'Pending',
      sentDate: 'Just now',
    };
    setInvitations((prev) => [newInv, ...prev]);
  };

  const cancelInvitation = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
  };

  // Challenges & Challenge Responses
  const createChallenge = (opponentTeam: string, sport: string, dateVenue: string) => {
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
  };

  const acceptChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Accepted' } : c))
    );
  };

  const declineChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Declined' } : c))
    );
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
