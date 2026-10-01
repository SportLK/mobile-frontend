import React, { createContext, useContext, useState } from 'react';
import { Team, TeamInvitation, JoinRequest, TeamChallenge, TeamMember, SportType } from '../types';
import { INITIAL_TEAMS, INITIAL_INVITATIONS, INITIAL_JOIN_REQUESTS, INITIAL_CHALLENGES, INITIAL_MEMBERS, CURRENT_USER } from '../data/mockData';

interface TeamContextType {
  teams: Team[];
  myTeams: Team[];
  invitations: TeamInvitation[];
  joinRequests: JoinRequest[];
  challenges: TeamChallenge[];
  members: Record<string, TeamMember[]>;
  user: typeof CURRENT_USER;
  
  createTeam: (data: {
    name: string;
    sport: SportType;
    district: string;
    description: string;
    contactInfo: string;
    maxPlayers: number;
    logo?: string;
  }) => Team;
  
  requestToJoinTeam: (teamId: string, position?: string, message?: string) => void;
  respondToInvitation: (invitationId: string, accept: boolean) => void;
  respondToJoinRequest: (requestId: string, accept: boolean) => void;
  sendInvitation: (teamId: string, inviteeName: string, role: string) => void;
  removeMember: (teamId: string, memberId: string) => void;
  changeMemberRole: (teamId: string, memberId: string, newRole: 'Captain' | 'Vice-Captain' | 'Player') => void;
  issueChallenge: (defenderTeamId: string, sport: SportType, date: string, venue: string, message: string) => void;
  respondToChallenge: (challengeId: string, accept: boolean) => void;
  leaveTeam: (teamId: string) => void;
  getTeamById: (teamId: string) => Team | undefined;
  getTeamMembers: (teamId: string) => TeamMember[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [invitations, setInvitations] = useState<TeamInvitation[]>(INITIAL_INVITATIONS);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(INITIAL_JOIN_REQUESTS);
  const [challenges, setChallenges] = useState<TeamChallenge[]>(INITIAL_CHALLENGES);
  const [members, setMembers] = useState<Record<string, TeamMember[]>>(INITIAL_MEMBERS);

  // My teams = teams where CURRENT_USER is captain OR in squad roster
  const myTeams = teams.filter(team => {
    if (team.captainId === CURRENT_USER.id) return true;
    const squad = members[team.id] || [];
    return squad.some(m => m.userId === CURRENT_USER.id);
  });

  const getTeamById = (teamId: string) => teams.find(t => t.id === teamId);

  const getTeamMembers = (teamId: string) => members[teamId] || [];

  const createTeam = (data: {
    name: string;
    sport: SportType;
    district: string;
    description: string;
    contactInfo: string;
    maxPlayers: number;
    logo?: string;
  }): Team => {
    const newTeamId = `team-${Date.now()}`;
    const newTeam: Team = {
      id: newTeamId,
      name: data.name,
      sport: data.sport,
      logo: data.logo || '🛡️',
      district: data.district,
      description: data.description,
      contactInfo: data.contactInfo,
      maxPlayers: Number(data.maxPlayers) || 20,
      currentMemberCount: 1,
      winCount: 0,
      slotsAvailable: (Number(data.maxPlayers) || 20) - 1,
      captainId: CURRENT_USER.id,
      captainName: CURRENT_USER.name,
      status: 'active',
    };

    const captainMember: TeamMember = {
      id: `m-${Date.now()}`,
      teamId: newTeamId,
      userId: CURRENT_USER.id,
      name: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      role: 'Captain',
      position: 'Captain',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setTeams(prev => [newTeam, ...prev]);
    setMembers(prev => ({
      ...prev,
      [newTeamId]: [captainMember],
    }));

    return newTeam;
  };

  const requestToJoinTeam = (teamId: string, position = 'Player', message = '') => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    // Check if user already requested
    const existing = joinRequests.find(r => r.teamId === teamId && r.userId === CURRENT_USER.id && r.status === 'pending');
    if (existing) return;

    const newRequest: JoinRequest = {
      id: `jr-${Date.now()}`,
      teamId,
      teamName: targetTeam.name,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      userAvatar: CURRENT_USER.avatar,
      sport: targetTeam.sport,
      position,
      message,
      status: 'pending',
      createdAt: 'Just now',
    };

    setJoinRequests(prev => [newRequest, ...prev]);
  };

  const respondToInvitation = (invitationId: string, accept: boolean) => {
    const invite = invitations.find(i => i.id === invitationId);
    if (!invite) return;

    setInvitations(prev => prev.map(i => i.id === invitationId ? { ...i, status: accept ? 'accepted' : 'declined' } : i));

    if (accept) {
      // Add user to team roster
      const targetTeam = teams.find(t => t.id === invite.teamId);
      if (targetTeam) {
        const newMember: TeamMember = {
          id: `m-${Date.now()}`,
          teamId: invite.teamId,
          userId: CURRENT_USER.id,
          name: CURRENT_USER.name,
          avatar: CURRENT_USER.avatar,
          role: 'Player',
          position: invite.role || 'Player',
          joinedDate: new Date().toISOString().split('T')[0],
        };

        setMembers(prev => ({
          ...prev,
          [invite.teamId]: [...(prev[invite.teamId] || []), newMember],
        }));

        setTeams(prev => prev.map(t => t.id === invite.teamId ? {
          ...t,
          currentMemberCount: t.currentMemberCount + 1,
          slotsAvailable: Math.max(0, t.slotsAvailable - 1)
        } : t));
      }
    }
  };

  const respondToJoinRequest = (requestId: string, accept: boolean) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    setJoinRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: accept ? 'accepted' : 'rejected' } : r));

    if (accept) {
      const newMember: TeamMember = {
        id: `m-${Date.now()}`,
        teamId: request.teamId,
        userId: request.userId,
        name: request.userName,
        avatar: request.userAvatar,
        role: 'Player',
        position: request.position || 'Player',
        joinedDate: new Date().toISOString().split('T')[0],
      };

      setMembers(prev => ({
        ...prev,
        [request.teamId]: [...(prev[request.teamId] || []), newMember],
      }));

      setTeams(prev => prev.map(t => t.id === request.teamId ? {
        ...t,
        currentMemberCount: t.currentMemberCount + 1,
        slotsAvailable: Math.max(0, t.slotsAvailable - 1)
      } : t));
    }
  };

  const sendInvitation = (teamId: string, inviteeName: string, role: string) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    const newInvite: TeamInvitation = {
      id: `inv-${Date.now()}`,
      teamId,
      teamName: targetTeam.name,
      sport: targetTeam.sport,
      inviterName: CURRENT_USER.name,
      role,
      status: 'pending',
      createdAt: 'Just now',
    };

    setInvitations(prev => [newInvite, ...prev]);
  };

  const removeMember = (teamId: string, memberId: string) => {
    setMembers(prev => ({
      ...prev,
      [teamId]: (prev[teamId] || []).filter(m => m.id !== memberId),
    }));

    setTeams(prev => prev.map(t => t.id === teamId ? {
      ...t,
      currentMemberCount: Math.max(1, t.currentMemberCount - 1),
      slotsAvailable: t.slotsAvailable + 1,
    } : t));
  };

  const changeMemberRole = (teamId: string, memberId: string, newRole: 'Captain' | 'Vice-Captain' | 'Player') => {
    setMembers(prev => ({
      ...prev,
      [teamId]: (prev[teamId] || []).map(m => m.id === memberId ? { ...m, role: newRole } : m),
    }));
  };

  const issueChallenge = (defenderTeamId: string, sport: SportType, date: string, venue: string, message: string) => {
    const challengerTeam = myTeams[0]; // User's primary team
    const defenderTeam = teams.find(t => t.id === defenderTeamId);

    if (!challengerTeam || !defenderTeam) return;

    const newChallenge: TeamChallenge = {
      id: `ch-${Date.now()}`,
      challengerTeamId: challengerTeam.id,
      challengerTeamName: challengerTeam.name,
      challengerLogo: challengerTeam.logo,
      defenderTeamId: defenderTeam.id,
      defenderTeamName: defenderTeam.name,
      defenderLogo: defenderTeam.logo,
      sport,
      date,
      venue,
      message,
      status: 'pending',
    };

    setChallenges(prev => [newChallenge, ...prev]);
  };

  const respondToChallenge = (challengeId: string, accept: boolean) => {
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, status: accept ? 'accepted' : 'declined' } : c));
  };

  const leaveTeam = (teamId: string) => {
    setMembers(prev => ({
      ...prev,
      [teamId]: (prev[teamId] || []).filter(m => m.userId !== CURRENT_USER.id),
    }));

    setTeams(prev => prev.map(t => t.id === teamId ? {
      ...t,
      currentMemberCount: Math.max(0, t.currentMemberCount - 1),
      slotsAvailable: t.slotsAvailable + 1,
    } : t));
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        myTeams,
        invitations,
        joinRequests,
        challenges,
        members,
        user: CURRENT_USER,
        createTeam,
        requestToJoinTeam,
        respondToInvitation,
        respondToJoinRequest,
        sendInvitation,
        removeMember,
        changeMemberRole,
        issueChallenge,
        respondToChallenge,
        leaveTeam,
        getTeamById,
        getTeamMembers,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeamContext must be used within TeamProvider');
  return context;
};
