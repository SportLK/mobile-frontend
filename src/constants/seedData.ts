// Seed data for offline/demo mode
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

export const startingPosts: FeedPost[] = [
  {
    id: 'demo-1', author: 'Nethmi Perera', initials: 'NP',
    community: 'Colombo Badminton', ago: '12 min ago', sport: 'Badminton',
    body: 'Looking for a doubles partner for Saturday morning at the Sugathadasa courts. Intermediate level, good vibes only 🏸',
    likes: 28, comments: 6, liked: false,
  },
  {
    id: 'demo-2', author: 'Kavindu Silva', initials: 'KS',
    community: 'Cricket Community LK', ago: '34 min ago', sport: 'Cricket',
    body: 'That feeling when the whole team shows up early for practice. Big things coming this season! 🏏',
    likes: 42, comments: 9, liked: true,
  },
  {
    id: 'demo-3', author: 'Amaya Fernando', initials: 'AF',
    community: 'Sri Lanka Runners', ago: '1 hr ago', sport: 'Running',
    body: 'Sunrise run at Galle Face this Sunday, 6:00 AM. Easy 5K pace, everyone is welcome ☀️',
    likes: 17, comments: 3, liked: false,
  },
];

export const starterNotifications: Notification[] = [
  { id: 'n1', title: 'Welcome to SportLK!', body: 'Your sports community is ready. Find your people and get out there.', ago: 'Just now', unread: true, kind: 'welcome' },
  { id: 'n2', title: 'Kavindu liked your post', body: 'Your post in Colombo Badminton is getting noticed.', ago: '2 hours ago', unread: true, kind: 'like' },
  { id: 'n3', title: 'New in Cricket Community LK', body: 'There are 3 new posts from communities you follow.', ago: 'Yesterday', unread: false, kind: 'community' },
];

export const starterCommunities: Community[] = [
  { id: 'c1', name: 'Cricket Community LK', sport: 'Cricket', location: 'Island-wide', members: '2.4k', initials: '🏏', joined: true, color: 'sand' },
  { id: 'c2', name: 'Colombo Badminton', sport: 'Badminton', location: 'Colombo', members: '860', initials: '🏸', joined: true, color: 'blue' },
  { id: 'c3', name: 'Sri Lanka Runners', sport: 'Running', location: 'Island-wide', members: '1.8k', initials: '🏃', joined: false, color: 'green' },
  { id: 'c4', name: 'Weekend Football LK', sport: 'Football', location: 'Western Province', members: '1.2k', initials: '⚽', joined: false, color: 'purple' },
];
