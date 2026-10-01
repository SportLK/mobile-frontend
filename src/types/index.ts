export type SportType = 'Cricket' | 'Football' | 'Basketball' | 'Volleyball' | 'Badminton' | 'Tennis' | 'Athletics' | 'Rugby' | 'Swimming' | 'Esports';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  name: string;
  avatar?: string;
  role: 'Captain' | 'Vice-Captain' | 'Player';
  position: string;
  joinedDate: string;
}

export interface Team {
  id: string;
  name: string;
  sport: SportType;
  logo: string;
  district: string;
  description: string;
  contactInfo: string;
  maxPlayers: number;
  currentMemberCount: number;
  winCount: number;
  slotsAvailable: number;
  captainId: string;
  captainName: string;
  status: 'active' | 'suspended';
  roster?: TeamMember[];
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  sport: SportType;
  inviterName: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  teamId: string;
  teamName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  sport: SportType;
  position: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface TeamChallenge {
  id: string;
  challengerTeamId: string;
  challengerTeamName: string;
  challengerLogo: string;
  defenderTeamId: string;
  defenderTeamName: string;
  defenderLogo: string;
  sport: SportType;
  date: string;
  venue: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  scoreChallenger?: string;
  scoreDefender?: string;
}
