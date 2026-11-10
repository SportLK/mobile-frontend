// Clean base configuration for SportLK
import { Community, FeedPost, Notification } from '../types';

export const sports = [
  'Cricket', 'Football', 'Badminton', 'Volleyball',
  'Running', 'Swimming', 'Basketball', 'Rugby',
];

export const workspaces: { key: import('../types').Workspace; label: string; short: string }[] = [
  { key: 'player', label: 'Player', short: 'Player' },
  { key: 'team_manager', label: 'Team manager', short: 'Manager' },
  { key: 'organizer', label: 'Tournament organizer', short: 'Organizer' },
];

export const startingPosts: FeedPost[] = [];
export const starterNotifications: Notification[] = [];
export const starterCommunities: Community[] = [];
