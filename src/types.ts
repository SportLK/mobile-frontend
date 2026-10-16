// Shared types for SportLK mobile app

export type Tab = 'Home' | 'Discover' | 'Alerts' | 'Profile';
export type Workspace = 'player' | 'team_manager' | 'organizer';
export type FeedPost = {
  id: string;
  author: string;
  initials: string;
  community: string;
  ago: string;
  sport: string;
  body: string;
  likes: number;
  comments: number;
  liked: boolean;
};
export type FeedComment = { author: string; body: string };
export type RoleApplication = {
  role: Exclude<Workspace, 'player'>;
  status: 'Pending' | 'Approved' | 'Declined';
};
export type Community = {
  id: string;
  name: string;
  sport: string;
  location: string;
  members: string;
  initials: string;
  joined: boolean;
  color: string;
};
export type Notification = {
  id: string;
  title: string;
  body: string;
  ago: string;
  unread: boolean;
  kind: string;
};
