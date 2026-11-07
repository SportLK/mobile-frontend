import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { apiRequest, AuthResponse } from '../api';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import {
  sports,
  workspaces,
  startingPosts,
  starterNotifications,
  starterCommunities,
} from '../constants/seedData';
import { Community, FeedComment, FeedPost, Notification, RoleApplication, Workspace } from '../types';
import SportsHubScreen from './SportsHubScreen';
import TournamentsScreen from './tournaments/TournamentsScreen';
import OrganizerApplicationScreen from './tournaments/OrganizerApplicationScreen';
import OrganizerWorkspaceScreen from './tournaments/OrganizerWorkspaceScreen';
import CreateTournamentScreen from './tournaments/CreateTournamentScreen';
import TournamentDetailScreen from './tournaments/TournamentDetailScreen';
import BracketTreeScreen from './tournaments/BracketTreeScreen';
import SchedulesScreen from './tournaments/SchedulesScreen';
import TeamsScreen from './teams/TeamsScreen';
import { Tournament } from '../types/tournament.types';
import {
  HomeIcon,
  CommunityIcon,
  TournamentsIcon,
  VenuesIcon,
  ProfileIcon,
} from '../components/NavIcons';

// ── Helpers ──────────────────────────────────────────────────────────────────
function bubbleStyle(color: string) {
  if (color === 'blue') return s.bubble_blue;
  if (color === 'green') return s.bubble_green;
  if (color === 'purple') return s.bubble_purple;
  return s.bubble_sand;
}

export type MainTab = 'Home' | 'Community' | 'Tournaments' | 'Venues' | 'Profile';

// ── Main App Shell ───────────────────────────────────────────────────────────
export default function MainApp() {
  const {
    accessToken, refreshToken, userName, userEmail, userCity,
    roles, workspace, setWorkspace, signOut, setUserName, setUserCity, setRoles,
  } = useAuth();

  const [tab, setTab] = useState<MainTab>('Home');
  const [posts, setPosts] = useState(startingPosts);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, FeedComment[]>>({});
  const [notifications, setNotifications] = useState(starterNotifications);
  const [communities, setCommunities] = useState(starterCommunities);
  const [interests, setInterests] = useState(['Cricket', 'Badminton', 'Running']);
  const [applications, setApplications] = useState<RoleApplication[]>([]);

  // Modals
  const [composerOpen, setComposerOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [reportingPost, setReportingPost] = useState<FeedPost | null>(null);
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [commentingPost, setCommentingPost] = useState<string | null>(null);
  const [newPost, setNewPost] = useState('');
  const [commentText, setCommentText] = useState('');
  const [roleChoice, setRoleChoice] = useState<Exclude<Workspace, 'player'>>('team_manager');
  const [organization, setOrganization] = useState('');
  const [experience, setExperience] = useState('');
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileNameDraft, setProfileNameDraft] = useState('');
  const [profileCityDraft, setProfileCityDraft] = useState('');
  const [organizerAppOpen, setOrganizerAppOpen] = useState(false);
  const [createTournamentOpen, setCreateTournamentOpen] = useState(false);
  const [workspaceRefreshKey, setWorkspaceRefreshKey] = useState(0);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [bracketTournament, setBracketTournament] = useState<Tournament | null>(null);
  const [scheduleTournament, setScheduleTournament] = useState<Tournament | null>(null);
  const [organizerWorkspaceOpen, setOrganizerWorkspaceOpen] = useState(false);
  const [teamsModalOpen, setTeamsModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);

  const firstName = userName ? userName.split(' ')[0] : 'Player';
  const unreadCount = notifications.filter((n) => n.unread).length;
  const joinedCount = useMemo(() => communities.filter((c) => c.joined).length, [communities]);
  const currentWorkspaceLabel = workspaces.find((w) => w.key === workspace)?.label ?? 'Player';

  // Real-time formatted date string
  const currentDateFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  // Fetch live backend data when authenticated
  useEffect(() => {
    if (!accessToken) return;

    apiRequest<Array<{ id: string; authorId: string; body: string; sport?: string; likesCount: number; commentsCount: number; createdAt: string }>>('/community/posts', {}, accessToken)
      .then((items) => setPosts(items.map((item) => ({
        id: item.id,
        author: 'SportLK Player',
        initials: 'SP',
        community: item.sport ? `${item.sport} Community` : 'SportLK Community',
        ago: 'Recently',
        sport: item.sport ?? 'Community',
        body: item.body,
        likes: item.likesCount,
        comments: item.commentsCount,
        liked: false,
      }))))
      .catch(() => undefined);

    apiRequest<Array<{ id: string; name: string; sport: string; location?: string; memberCount: number; isMember: boolean }>>('/communities', {}, accessToken)
      .then((items) => setCommunities(items.map((item) => ({
        id: item.id,
        name: item.name,
        sport: item.sport,
        location: item.location ?? 'Sri Lanka',
        members: item.memberCount >= 1000 ? `${(item.memberCount / 1000).toFixed(1)}k` : String(item.memberCount),
        initials: item.sport === 'Cricket' ? '🏏' : item.sport === 'Badminton' ? '🏸' : item.sport === 'Football' ? '⚽' : '●',
        joined: item.isMember,
        color: item.sport === 'Cricket' ? 'sand' : item.sport === 'Football' ? 'purple' : 'blue',
      }))))
      .catch(() => undefined);

    apiRequest<{ id: string; displayName: string; email: string; roles: AuthResponse['user']['roles']; sports: string[]; city?: string | null }>('/users/me', {}, accessToken)
      .then((profile) => {
        setUserName(profile.displayName);
        setUserCity(profile.city ?? '');
        setRoles(profile.roles.filter((r): r is Workspace => r !== 'admin'));
        setInterests(profile.sports ?? []);
      })
      .catch(() => undefined);

    apiRequest<Array<{ id: string; title: string; body: string; readAt: string | null; createdAt: string }>>('/notifications', {}, accessToken)
      .then((items) => setNotifications(items.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        ago: 'Recently',
        unread: !item.readAt,
        kind: 'general',
      }))))
      .catch(() => undefined);

    apiRequest<Array<{ id: string; requestedRole: 'team_manager' | 'organizer'; status: 'pending' | 'approved' | 'rejected' }>>('/role-applications/mine', {}, accessToken)
      .then((items) => setApplications(items.map((item): RoleApplication => ({
        role: item.requestedRole,
        status: item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Declined' : 'Pending',
      }))))
      .catch(() => undefined);
  }, [accessToken]);

  // Actions
  function toggleLike(id: string) {
    const selected = posts.find((p) => p.id === id);
    if (!selected) return;
    setPosts((items) => items.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)));
    if (accessToken && !id.startsWith('demo-') && !id.startsWith('local-')) {
      apiRequest(`/community/posts/${id}/like`, { method: 'POST' }, accessToken).catch(() => undefined);
    }
  }

  async function publishPost() {
    const body = newPost.trim();
    if (!body) return;
    const post: FeedPost = {
      id: `local-${Date.now()}`,
      author: userName,
      initials: userName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
      community: 'Your sports community',
      ago: 'Just now',
      sport: interests[0] ?? 'Community',
      body,
      likes: 0,
      comments: 0,
      liked: false,
    };
    setPosts((items) => [post, ...items]);
    setNewPost('');
    setComposerOpen(false);

    if (accessToken) {
      try {
        await apiRequest('/community/posts', {
          method: 'POST',
          body: JSON.stringify({ body, sport: interests[0] ?? 'General' }),
        }, accessToken);
      } catch {
        // Kept locally
      }
    }
  }

  function openComments(id: string) {
    setCommentingPost((curr) => (curr === id ? null : id));
  }

  async function submitComment(id: string) {
    const body = commentText.trim();
    if (!body) return;
    const comment: FeedComment = { author: userName, body };
    setCommentsByPost((curr) => ({ ...curr, [id]: [...(curr[id] ?? []), comment] }));
    setPosts((items) => items.map((p) => (p.id === id ? { ...p, comments: p.comments + 1 } : p)));
    setCommentText('');

    if (accessToken && !id.startsWith('demo-') && !id.startsWith('local-')) {
      apiRequest(`/community/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }, accessToken).catch(() => undefined);
    }
  }

  async function submitReport(reason: string) {
    if (!reportingPost) return;
    if (accessToken && !reportingPost.id.startsWith('demo-')) {
      apiRequest('/reports', {
        method: 'POST',
        body: JSON.stringify({ targetType: 'post', targetId: reportingPost.id, reason }),
      }, accessToken).catch(() => undefined);
    }
    Alert.alert('Report received', 'Thank you for keeping SportLK safe and welcoming.');
    setReportingPost(null);
  }

  async function submitApplication() {
    if (!organization.trim() || experience.trim().length < 15) {
      Alert.alert('A little more detail', 'Add your organization and at least a few sentences about your experience.');
      return;
    }
    if (accessToken) {
      try {
        await apiRequest('/role-applications', {
          method: 'POST',
          body: JSON.stringify({ requestedRole: roleChoice, organization: organization.trim(), experience: experience.trim() }),
        }, accessToken);
      } catch (error) {
        Alert.alert('Application not sent', error instanceof Error ? error.message : 'The application could not sync yet.');
        return;
      }
    }
    setApplications((items) => [{ role: roleChoice, status: 'Pending' }, ...items.filter((i) => i.role !== roleChoice)]);
    setApplicationOpen(false);
    setOrganization('');
    setExperience('');
    Alert.alert('Application Submitted', 'Your application is under review by the SportLK administrative team.');
  }

  function markAllRead() {
    setNotifications((items) => items.map((n) => ({ ...n, unread: false })));
    if (accessToken) apiRequest('/notifications/read-all', { method: 'PATCH' }, accessToken).catch(() => undefined);
  }

  function toggleInterest(sport: string) {
    const next = interests.includes(sport) ? interests.filter((i) => i !== sport) : [...interests, sport];
    setInterests(next);
    if (accessToken) apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify({ sports: next }) }, accessToken).catch(() => undefined);
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={s.appFrame}>
        {/* Top App Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <View style={s.brandMark}>
              <Text style={s.brandMarkText}>S</Text>
              <View style={s.brandDot} />
            </View>
            <View>
              <Text style={s.brandName}>Sport<Text style={s.brandGold}>LK</Text></Text>
              <Text style={s.brandTag}>YOUR GAME. YOUR PEOPLE.</Text>
            </View>
          </View>
          <View style={s.headerActions}>
            <Pressable
              style={s.activeWorkspace}
              onPress={() => {
                if (workspace === 'organizer') setOrganizerWorkspaceOpen(true);
                else if (workspace === 'team_manager') setTeamsModalOpen(true);
                else setTab('Profile');
              }}
            >
              <Text style={s.activeWorkspaceText}>{currentWorkspaceLabel}</Text>
              <Text style={s.activeWorkspaceChevron}>▾</Text>
            </Pressable>

            <Pressable style={s.headerIcon} onPress={() => setAlertsModalOpen(true)}>
              <Text style={s.headerIconText}>🔔</Text>
              {unreadCount > 0 && <View style={s.noticeDot} />}
            </Pressable>

            <Pressable style={s.headerAvatar} onPress={() => setTab('Profile')}>
              <Text style={s.headerAvatarText}>
                {userName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Tab Views */}
        {tab === 'Home' && (
          <HomeFeed
            firstName={firstName}
            currentDate={currentDateFormatted}
            posts={posts}
            commentsByPost={commentsByPost}
            communities={communities}
            joinedCount={joinedCount}
            onCompose={() => setComposerOpen(true)}
            onNavigateTab={(targetTab) => setTab(targetTab)}
            onOpenTeams={() => setTeamsModalOpen(true)}
            onLike={toggleLike}
            onReport={setReportingPost}
            onComment={openComments}
            commentingPost={commentingPost}
            commentText={commentText}
            setCommentText={setCommentText}
            onSubmitComment={submitComment}
          />
        )}

        {tab === 'Community' && (
          <CommunityScreen
            firstName={firstName}
            posts={posts}
            commentsByPost={commentsByPost}
            communities={communities}
            setCommunities={setCommunities}
            accessToken={accessToken}
            onCompose={() => setComposerOpen(true)}
            onLike={toggleLike}
            onReport={setReportingPost}
            onComment={openComments}
            commentingPost={commentingPost}
            commentText={commentText}
            setCommentText={setCommentText}
            onSubmitComment={submitComment}
          />
        )}

        {tab === 'Tournaments' && (
          <TournamentsScreen
            onSelectTournament={(t) => setSelectedTournament(t)}
            onOpenBrackets={(t) => setBracketTournament(t)}
            onOpenSchedules={(t) => setScheduleTournament(t)}
            onCreateTournament={() => setCreateTournamentOpen(true)}
            onOpenOrganizerWorkspace={() => setOrganizerWorkspaceOpen(true)}
            onApplyOrganizer={() => setOrganizerAppOpen(true)}
          />
        )}

        {tab === 'Venues' && <SportsHubScreen initialTab="venues" />}

        {tab === 'Profile' && (
          <Profile
            name={userName}
            email={userEmail}
            city={userCity}
            interests={interests}
            roles={roles}
            workspace={workspace}
            applications={applications}
            onToggleInterest={toggleInterest}
            onWorkspace={setWorkspace}
            onOpenTeams={() => setTeamsModalOpen(true)}
            onApply={() => setApplicationOpen(true)}
            onOpenOrganizerApp={() => setOrganizerAppOpen(true)}
            onOpenOrganizerWorkspace={() => setOrganizerWorkspaceOpen(true)}
            onOpenAlerts={() => setAlertsModalOpen(true)}
            onEdit={() => {
              setProfileNameDraft(userName);
              setProfileCityDraft(userCity);
              setProfileEditOpen(true);
            }}
            onSignOut={signOut}
          />
        )}

        {/* ── Fixed Bottom Navigation Bar (Figma Design 1:1) ───────────────── */}
        <View style={s.bottomNav}>
          <Pressable style={s.tabButton} onPress={() => setTab('Home')}>
            <HomeIcon color={tab === 'Home' ? '#111827' : '#9CA3AF'} size={24} />
            <Text style={[s.tabLabel, tab === 'Home' && s.tabLabelActive]}>Home</Text>
          </Pressable>

          <Pressable style={s.tabButton} onPress={() => setTab('Community')}>
            <CommunityIcon color={tab === 'Community' ? '#111827' : '#9CA3AF'} size={24} />
            <Text style={[s.tabLabel, tab === 'Community' && s.tabLabelActive]}>Community</Text>
          </Pressable>

          <Pressable style={s.tabButton} onPress={() => setTab('Tournaments')}>
            <TournamentsIcon color={tab === 'Tournaments' ? '#111827' : '#9CA3AF'} size={24} />
            <Text style={[s.tabLabel, tab === 'Tournaments' && s.tabLabelActive]}>Tournaments</Text>
          </Pressable>

          <Pressable style={s.tabButton} onPress={() => setTab('Venues')}>
            <VenuesIcon color={tab === 'Venues' ? '#111827' : '#9CA3AF'} size={24} />
            <Text style={[s.tabLabel, tab === 'Venues' && s.tabLabelActive]}>Venues</Text>
          </Pressable>

          <Pressable style={s.tabButton} onPress={() => setTab('Profile')}>
            <ProfileIcon color={tab === 'Profile' ? '#111827' : '#9CA3AF'} size={24} />
            <Text style={[s.tabLabel, tab === 'Profile' && s.tabLabelActive]}>Profile</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Modals & Subscreens ────────────────────────────────────────────── */}
      <ComposerModal
        visible={composerOpen}
        value={newPost}
        onChange={setNewPost}
        onClose={() => setComposerOpen(false)}
        onPublish={publishPost}
        name={userName}
      />

      <ApplicationModal
        visible={applicationOpen}
        role={roleChoice}
        setRole={setRoleChoice}
        organization={organization}
        setOrganization={setOrganization}
        experience={experience}
        setExperience={setExperience}
        onClose={() => setApplicationOpen(false)}
        onSubmit={submitApplication}
      />

      <NameModal
        visible={profileEditOpen}
        name={profileNameDraft}
        setName={setProfileNameDraft}
        city={profileCityDraft}
        setCity={setProfileCityDraft}
        onClose={() => setProfileEditOpen(false)}
        onSave={() => {
          const displayName = profileNameDraft.trim();
          const city = profileCityDraft.trim();
          if (displayName.length < 2) return;
          setUserName(displayName);
          setUserCity(city);
          if (accessToken) apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify({ displayName, city }) }, accessToken).catch(() => undefined);
          setProfileEditOpen(false);
        }}
      />

      <ReportModal
        visible={Boolean(reportingPost)}
        reason={reportReason}
        setReason={setReportReason}
        onClose={() => setReportingPost(null)}
        onSubmit={submitReport}
      />

      <Modal visible={organizerAppOpen} animationType="slide" onRequestClose={() => setOrganizerAppOpen(false)}>
        <OrganizerApplicationScreen
          onBack={() => setOrganizerAppOpen(false)}
          onNavigateToWorkspace={() => {
            setOrganizerAppOpen(false);
            setWorkspace('organizer');
            setOrganizerWorkspaceOpen(true);
          }}
        />
      </Modal>

      <Modal visible={createTournamentOpen} animationType="slide" onRequestClose={() => setCreateTournamentOpen(false)}>
        <CreateTournamentScreen
          onBack={() => setCreateTournamentOpen(false)}
          onCreateSuccess={() => {
            setCreateTournamentOpen(false);
            setWorkspaceRefreshKey((k) => k + 1);
          }}
        />
      </Modal>

      <Modal visible={Boolean(selectedTournament)} animationType="slide" onRequestClose={() => setSelectedTournament(null)}>
        {selectedTournament && (
          <TournamentDetailScreen
            tournament={selectedTournament}
            onBack={() => setSelectedTournament(null)}
            onTournamentUpdated={() => setWorkspaceRefreshKey((k) => k + 1)}
            onOpenBrackets={(t) => setBracketTournament(t)}
            onOpenSchedules={(t) => setScheduleTournament(t)}
          />
        )}
      </Modal>

      <Modal visible={Boolean(bracketTournament)} animationType="slide" onRequestClose={() => setBracketTournament(null)}>
        {bracketTournament && (
          <BracketTreeScreen
            tournament={bracketTournament}
            onBack={() => setBracketTournament(null)}
            onTournamentUpdated={() => setWorkspaceRefreshKey((k) => k + 1)}
          />
        )}
      </Modal>

      <Modal visible={Boolean(scheduleTournament)} animationType="slide" onRequestClose={() => setScheduleTournament(null)}>
        {scheduleTournament && (
          <SchedulesScreen
            tournament={scheduleTournament}
            onBack={() => setScheduleTournament(null)}
            onNavigateToBrackets={() => {
              const t = scheduleTournament;
              setScheduleTournament(null);
              setBracketTournament(t);
            }}
          />
        )}
      </Modal>

      <Modal visible={organizerWorkspaceOpen} animationType="slide" onRequestClose={() => setOrganizerWorkspaceOpen(false)}>
        <OrganizerWorkspaceScreen
          key={workspaceRefreshKey}
          onCreateTournament={() => setCreateTournamentOpen(true)}
          onSelectTournament={(t) => setSelectedTournament(t)}
          onManageBrackets={(t) => setBracketTournament(t)}
          onManageRegistrations={(t) => setSelectedTournament(t)}
          onSwitchWorkspace={() => setOrganizerWorkspaceOpen(false)}
        />
      </Modal>

      {/* Teams & Squads Modal */}
      <Modal visible={teamsModalOpen} animationType="slide" onRequestClose={() => setTeamsModalOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <TeamsScreen onBack={() => setTeamsModalOpen(false)} />
        </SafeAreaView>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={alertsModalOpen} animationType="slide" onRequestClose={() => setAlertsModalOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FBFAF8' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>Notifications</Text>
            <TouchableOpacity onPress={() => setAlertsModalOpen(false)} style={{ padding: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#6B7280' }}>✕ Close</Text>
            </TouchableOpacity>
          </View>
          <Alerts
            notifications={notifications}
            setNotifications={setNotifications}
            onMarkAll={markAllRead}
            onRead={(id) => {
              if (accessToken) apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }, accessToken).catch(() => undefined);
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Screen: Home Feed & Hub ──────────────────────────────────────────────────
function HomeFeed({
  firstName,
  currentDate,
  posts,
  commentsByPost,
  communities,
  joinedCount,
  onCompose,
  onNavigateTab,
  onOpenTeams,
  onLike,
  onReport,
  onComment,
  commentingPost,
  commentText,
  setCommentText,
  onSubmitComment,
}: {
  firstName: string;
  currentDate: string;
  posts: FeedPost[];
  commentsByPost: Record<string, FeedComment[]>;
  communities: Community[];
  joinedCount: number;
  onCompose: () => void;
  onNavigateTab: (tab: MainTab) => void;
  onOpenTeams: () => void;
  onLike: (id: string) => void;
  onReport: (post: FeedPost) => void;
  onComment: (id: string) => void;
  commentingPost: string | null;
  commentText: string;
  setCommentText: (v: string) => void;
  onSubmitComment: (id: string) => void;
}) {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Real-time Date and Dynamic Greeting */}
      <View style={s.greetingRow}>
        <View>
          <Text style={s.kicker}>{currentDate.toUpperCase()}</Text>
          <Text style={s.greeting}>Good day, {firstName} <Text style={s.wave}>☀️</Text></Text>
          <Text style={s.subGreeting}>Ready to get moving today?</Text>
        </View>
        <View style={s.dayChip}><Text style={s.dayChipText}>LK · 32°</Text></View>
      </View>

      {/* Hero Banner Card */}
      <View style={s.heroCard}>
        <View style={s.heroGlow} />
        <View>
          <Text style={s.heroEyebrow}>THE SPORTLK COMMUNITY</Text>
          <Text style={s.heroTitle}>Your game.{"\n"}Your people.</Text>
          <Text style={s.heroDescription}>Find your team, share your wins, and play more grassroots sports.</Text>
          <Pressable style={s.heroButton} onPress={onCompose}>
            <Text style={s.heroButtonText}>Share an update <Text style={s.heroArrow}>↗</Text></Text>
          </Pressable>
        </View>
        <View style={s.heroBall}><Text style={s.heroBallText}>S</Text><View style={s.heroBallArc} /></View>
        <View style={s.heroFoot}>
          <Text style={s.heroFootStrong}>{joinedCount} communities joined</Text>
          <Text style={s.heroFootDivider}>·</Text>
          <Text style={{ color: '#C6D2DE', fontSize: 8 }}>Explore upcoming matches & tournaments</Text>
        </View>
      </View>

      {/* Unified 4-Module Quick Cards */}
      <View style={s.hubCardsRow}>
        {/* Member 4: Live & Matches */}
        <TouchableOpacity style={s.hubCard} onPress={() => onNavigateTab('Venues')}>
          <View style={s.hubCardIconRow}>
            <Text style={s.hubCardIcon}>🏏</Text>
            <View style={s.liveChip}><Text style={s.liveChipText}>LIVE</Text></View>
          </View>
          <Text style={s.hubCardTitle}>Matches & Scores</Text>
          <Text style={s.hubCardSub}>Colombo Lions CC vs Kandy Kings CC · Over 14.2</Text>
          <Text style={s.hubCardLink}>View Live Score →</Text>
        </TouchableOpacity>

        {/* Member 3: Tournaments */}
        <TouchableOpacity style={s.hubCard} onPress={() => onNavigateTab('Tournaments')}>
          <View style={s.hubCardIconRow}>
            <Text style={s.hubCardIcon}>🏆</Text>
            <View style={s.openChip}><Text style={s.openChipText}>OPEN</Text></View>
          </View>
          <Text style={s.hubCardTitle}>Tournaments</Text>
          <Text style={s.hubCardSub}>Colombo Premier T20 League · 12 / 16 Teams</Text>
          <Text style={s.hubCardLink}>Browse Tournaments →</Text>
        </TouchableOpacity>
      </View>

      <View style={s.hubCardsRow}>
        {/* Member 2: Teams & Squads */}
        <TouchableOpacity style={s.hubCard} onPress={onOpenTeams}>
          <View style={s.hubCardIconRow}>
            <Text style={s.hubCardIcon}>👥</Text>
            <View style={[s.openChip, { backgroundColor: '#FEF3C7' }]}><Text style={[s.openChipText, { color: '#92400E' }]}>SQUAD</Text></View>
          </View>
          <Text style={s.hubCardTitle}>My Teams & Roster</Text>
          <Text style={s.hubCardSub}>Manage squad players, invitations & challenges</Text>
          <Text style={s.hubCardLink}>Open Team Manager →</Text>
        </TouchableOpacity>

        {/* Member 4: Venues & Grounds */}
        <TouchableOpacity style={s.hubCard} onPress={() => onNavigateTab('Venues')}>
          <View style={s.hubCardIconRow}>
            <Text style={s.hubCardIcon}>📍</Text>
            <View style={[s.openChip, { backgroundColor: '#E0E7FF' }]}><Text style={[s.openChipText, { color: '#3730A3' }]}>GROUNDS</Text></View>
          </View>
          <Text style={s.hubCardTitle}>Nearby Venues</Text>
          <Text style={s.hubCardSub}>Colombo Oval, CR&FC Grounds, Sugathadasa</Text>
          <Text style={s.hubCardLink}>Find Grounds →</Text>
        </TouchableOpacity>
      </View>

      {/* Your Communities Section */}
      <View style={s.sectionHead}>
        <View>
          <Text style={s.sectionTitle}>Your communities</Text>
          <Text style={s.sectionSub}>Clubs & groups connected to your sports</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateTab('Community')}>
          <Text style={s.sectionArrow}>View all →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.communityStrip}>
        {communities.filter((c) => c.joined).map((c) => (
          <View style={s.communityBubbleWrap} key={c.id}>
            <View style={[s.communityBubble, bubbleStyle(c.color)]}>
              <Text style={s.communityEmoji}>{c.initials}</Text>
            </View>
            <Text style={s.communityBubbleName} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
          </View>
        ))}
        <Pressable style={s.communityBubbleWrap} onPress={() => onNavigateTab('Community')}>
          <View style={s.addCommunityBubble}><Text style={s.addCommunityPlus}>＋</Text></View>
          <Text style={s.communityBubbleName}>Discover</Text>
        </Pressable>
      </ScrollView>

      {/* Community Feed Section */}
      <View style={s.feedSectionHead}>
        <View>
          <Text style={s.sectionTitle}>Community feed</Text>
          <Text style={s.sectionSub}>Latest highlights and posts from grassroots players</Text>
        </View>
        <View style={s.feedSort}>
          <Text style={s.feedSortText}>For you</Text>
          <Text style={s.feedSortChevron}>▾</Text>
        </View>
      </View>
      <Pressable style={s.quickCompose} onPress={onCompose}>
        <View style={s.quickAvatar}><Text style={s.quickAvatarText}>{firstName.slice(0, 1)}</Text></View>
        <Text style={s.quickPlaceholder}>What's happening in your game?</Text>
        <View style={s.quickPlus}><Text style={s.quickPlusText}>＋</Text></View>
      </Pressable>

      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          comments={commentsByPost[post.id] ?? []}
          index={index}
          onLike={() => onLike(post.id)}
          onReport={() => onReport(post)}
          onComment={() => onComment(post.id)}
          commenting={commentingPost === post.id}
          commentText={commentText}
          setCommentText={setCommentText}
          onSubmitComment={() => onSubmitComment(post.id)}
        />
      ))}
      <View style={s.feedEnd}>
        <Text style={s.feedEndStar}>✦</Text>
        <Text style={s.feedEndText}>You're all caught up</Text>
        <Text style={s.feedEndSub}>Go make a little more sport happen.</Text>
      </View>
    </ScrollView>
  );
}

// ── Screen: Community (Feed + Discover) ──────────────────────────────────────
function CommunityScreen({
  firstName,
  posts,
  commentsByPost,
  communities,
  setCommunities,
  accessToken,
  onCompose,
  onLike,
  onReport,
  onComment,
  commentingPost,
  commentText,
  setCommentText,
  onSubmitComment,
}: {
  firstName: string;
  posts: FeedPost[];
  commentsByPost: Record<string, FeedComment[]>;
  communities: Community[];
  setCommunities: React.Dispatch<React.SetStateAction<Community[]>>;
  accessToken?: string;
  onCompose: () => void;
  onLike: (id: string) => void;
  onReport: (post: FeedPost) => void;
  onComment: (id: string) => void;
  commentingPost: string | null;
  commentText: string;
  setCommentText: (v: string) => void;
  onSubmitComment: (id: string) => void;
}) {
  const [subTab, setSubTab] = useState<'feed' | 'discover'>('feed');

  return (
    <View style={{ flex: 1 }}>
      {/* Top Segmented Sub-navigation */}
      <View style={s.communitySubTabs}>
        <TouchableOpacity
          style={[s.communitySubTab, subTab === 'feed' && s.communitySubTabActive]}
          onPress={() => setSubTab('feed')}
        >
          <Text style={[s.communitySubTabText, subTab === 'feed' && s.communitySubTabTextActive]}>
            💬 Community Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.communitySubTab, subTab === 'discover' && s.communitySubTabActive]}
          onPress={() => setSubTab('discover')}
        >
          <Text style={[s.communitySubTabText, subTab === 'discover' && s.communitySubTabTextActive]}>
            🔍 Discover Communities
          </Text>
        </TouchableOpacity>
      </View>

      {subTab === 'feed' ? (
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Pressable style={s.quickCompose} onPress={onCompose}>
            <View style={s.quickAvatar}><Text style={s.quickAvatarText}>{firstName.slice(0, 1)}</Text></View>
            <Text style={s.quickPlaceholder}>Share your scores, training, or thoughts...</Text>
            <View style={s.quickPlus}><Text style={s.quickPlusText}>＋</Text></View>
          </Pressable>

          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              comments={commentsByPost[post.id] ?? []}
              index={index}
              onLike={() => onLike(post.id)}
              onReport={() => onReport(post)}
              onComment={() => onComment(post.id)}
              commenting={commentingPost === post.id}
              commentText={commentText}
              setCommentText={setCommentText}
              onSubmitComment={() => onSubmitComment(post.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <Discover communities={communities} setCommunities={setCommunities} accessToken={accessToken} />
      )}
    </View>
  );
}

// ── Component: Post Card ─────────────────────────────────────────────────────
function PostCard({
  post,
  comments,
  index,
  onLike,
  onReport,
  onComment,
  commenting,
  commentText,
  setCommentText,
  onSubmitComment,
}: {
  post: FeedPost;
  comments: FeedComment[];
  index: number;
  onLike: () => void;
  onReport: () => void;
  onComment: () => void;
  commenting: boolean;
  commentText: string;
  setCommentText: (v: string) => void;
  onSubmitComment: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <View style={s.postCard}>
      <View style={s.postHeader}>
        <View style={[s.postAvatar, index % 3 === 1 && s.postAvatarBlue, index % 3 === 2 && s.postAvatarRose]}>
          <Text style={s.postAvatarText}>{post.initials}</Text>
        </View>
        <View style={s.postAuthor}>
          <Text style={s.postAuthorName}>{post.author}</Text>
          <Text style={s.postCommunity}>{post.community} <Text style={s.postMetaDot}>·</Text> {post.ago}</Text>
        </View>
        <Pressable style={s.postMore} onPress={() => setMenuOpen(!menuOpen)}>
          <Text style={s.moreGlyph}>···</Text>
        </Pressable>
      </View>
      {menuOpen && (
        <View style={s.postMenu}>
          <Pressable style={s.postMenuItem} onPress={() => { setMenuOpen(false); onReport(); }}>
            <Text style={s.postMenuText}>⚐  Report post</Text>
          </Pressable>
        </View>
      )}
      <View style={s.postSportRow}>
        <View style={s.sportTag}><Text style={s.sportTagDot}>● </Text><Text style={s.sportTagText}>{post.sport}</Text></View>
        <View style={s.postPublic}><Text style={s.postPublicText}>Community</Text></View>
      </View>
      <Text style={s.postBody}>{post.body}</Text>
      <View style={s.postCounts}><Text>{post.likes} appreciations</Text><Text>{post.comments} comments</Text></View>
      <View style={s.postActions}>
        <Pressable style={s.postAction} onPress={onLike}>
          <Text style={[s.postActionIcon, post.liked && s.likedIcon]}>{post.liked ? '♥' : '♡'}</Text>
          <Text style={[s.postActionText, post.liked && s.likedText]}>{post.liked ? 'Appreciated' : 'Appreciate'}</Text>
        </Pressable>
        <Pressable style={s.postAction} onPress={onComment}>
          <Text style={s.postActionIcon}>💬</Text><Text style={s.postActionText}>Comment</Text>
        </Pressable>
        <Pressable style={s.postAction} onPress={() => Alert.alert('Share', 'Post link copied to clipboard.')}>
          <Text style={s.postActionIcon}>↗</Text><Text style={s.postActionText}>Share</Text>
        </Pressable>
      </View>
      {commenting && comments.map((c, ci) => (
        <View key={`${post.id}-c-${ci}`} style={{ flexDirection: 'row', gap: 7, paddingTop: 8 }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF1E9' }}>
            <Text style={{ color: '#718264', fontSize: 8, fontWeight: '700' }}>{c.author.slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1, padding: 8, borderRadius: 7, backgroundColor: '#F7F7F4' }}>
            <Text style={{ color: '#687580', fontSize: 8, fontWeight: '700' }}>{c.author}</Text>
            <Text style={{ marginTop: 3, color: '#5E6974', fontSize: 9, lineHeight: 13 }}>{c.body}</Text>
          </View>
        </View>
      ))}
      {commenting && (
        <View style={s.commentComposer}>
          <TextInput
            style={s.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Write a thoughtful comment..."
            placeholderTextColor={COLORS.placeholder}
          />
          <Pressable disabled={!commentText.trim()} onPress={onSubmitComment} style={s.commentSend}>
            <Text style={s.commentSendText}>Send</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Component: Discover Communities ──────────────────────────────────────────
function Discover({
  communities,
  setCommunities,
  accessToken,
}: {
  communities: Community[];
  setCommunities: React.Dispatch<React.SetStateAction<Community[]>>;
  accessToken?: string;
}) {
  const [selectedSport, setSelectedSport] = useState('All sports');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const visible = communities.filter((c) => selectedSport === 'All sports' || c.sport === selectedSport);

  async function join(id: string) {
    const community = communities.find((c) => c.id === id);
    if (!community || pendingId) return;
    setPendingId(id);
    try {
      let memberCount: number | undefined;
      if (accessToken && !/^c[1-4]$/.test(id)) {
        const result = await apiRequest<{ isMember: boolean; memberCount: number }>(`/communities/${id}/join`, {
          method: community.joined ? 'DELETE' : 'POST',
        }, accessToken);
        memberCount = result.memberCount;
      }
      setCommunities((items) => items.map((item) => item.id === id ? {
        ...item, joined: !community.joined,
        ...(memberCount !== undefined ? { members: memberCount >= 1000 ? `${(memberCount / 1000).toFixed(1)}k` : String(memberCount) } : {}),
      } : item));
    } catch (error) {
      Alert.alert('Could not update membership', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <PageIntro eyebrow="FIND YOUR PEOPLE" title="Discover communities" subtitle="Local clubs, shared interests, and new teammates." />
      <View style={s.discoverBanner}>
        <Text style={s.discoverBannerLabel}>YOUR NEXT GAME STARTS HERE</Text>
        <Text style={s.discoverBannerTitle}>There's a place for every player.</Text>
        <Text style={s.discoverBannerText}>Meet people who love the game as much as you do.</Text>
      </View>
      <Text style={s.fieldLabel}>EXPLORE BY SPORT</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sportFilters}>
        {['All sports', ...sports.slice(0, 6)].map((sport) => (
          <Pressable key={sport} onPress={() => setSelectedSport(sport)} style={[s.filterChip, selectedSport === sport && s.filterChipActive]}>
            <Text style={[s.filterChipText, selectedSport === sport && s.filterChipTextActive]}>{sport}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={s.sectionHead}>
        <View><Text style={s.sectionTitle}>Popular near you</Text><Text style={s.sectionSub}>Active groups across Sri Lanka</Text></View>
      </View>
      {visible.map((c) => (
        <View style={s.discoverCard} key={c.id}>
          <View style={[s.discoverIcon, bubbleStyle(c.color)]}><Text style={s.discoverEmoji}>{c.initials}</Text></View>
          <View style={s.discoverInfo}>
            <Text style={s.discoverName}>{c.name}</Text>
            <Text style={s.discoverMeta}>{c.sport} <Text style={s.postMetaDot}>·</Text> {c.location}</Text>
            <Text style={s.discoverMembers}>{c.members} players</Text>
          </View>
          <Pressable style={[s.joinButton, c.joined && s.joinedButton]} onPress={() => join(c.id)}>
            <Text style={[s.joinButtonText, c.joined && s.joinedButtonText]}>{c.joined ? 'Joined' : 'Join'}</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Component: Notifications / Alerts ────────────────────────────────────────
function Alerts({
  notifications,
  setNotifications,
  onMarkAll,
  onRead,
}: {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onMarkAll: () => void;
  onRead: (id: string) => void;
}) {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <PageIntro eyebrow="STAY IN THE LOOP" title="Notifications" subtitle="The good stuff happening around your sports & games." />
      <View style={s.alertToolbar}>
        <View style={s.alertCount}><View style={s.alertCountDot} /><Text style={s.alertCountText}>{notifications.filter((n) => n.unread).length} unread</Text></View>
        <Pressable onPress={onMarkAll}><Text style={s.markReadText}>Mark all as read</Text></Pressable>
      </View>
      {notifications.map((n, index) => (
        <Pressable
          key={n.id}
          style={[s.notificationCard, n.unread && s.notificationUnread]}
          onPress={() => {
            setNotifications((items) => items.map((i) => i.id === n.id ? { ...i, unread: false } : i));
            onRead(n.id);
          }}
        >
          <View style={[s.notificationIcon, index === 0 ? s.notifWelcome : index === 1 ? s.notifLike : s.notifCommunity]}>
            <Text>{index === 0 ? '✦' : index === 1 ? '♥' : '●'}</Text>
          </View>
          <View style={s.notificationCopy}>
            <Text style={s.notificationTitle}>{n.title}</Text>
            <Text style={s.notificationBody}>{n.body}</Text>
            <Text style={s.notificationTime}>{n.ago}</Text>
          </View>
          {n.unread && <View style={s.unreadDot} />}
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ── Component: Profile & Settings ────────────────────────────────────────────
function Profile({
  name,
  email,
  city,
  interests,
  roles,
  workspace,
  applications,
  onToggleInterest,
  onWorkspace,
  onOpenTeams,
  onApply,
  onEdit,
  onSignOut,
  onOpenOrganizerApp,
  onOpenOrganizerWorkspace,
  onOpenAlerts,
}: {
  name: string;
  email: string;
  city: string;
  interests: string[];
  roles: Workspace[];
  workspace: Workspace;
  applications: RoleApplication[];
  onToggleInterest: (sport: string) => void;
  onWorkspace: (w: Workspace) => void;
  onOpenTeams: () => void;
  onApply: () => void;
  onEdit: () => void;
  onSignOut: () => void;
  onOpenOrganizerApp: () => void;
  onOpenOrganizerWorkspace: () => void;
  onOpenAlerts: () => void;
}) {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <PageIntro eyebrow="YOUR SPORTLK" title="Your profile" subtitle="A little about you, your squad, and the games you love." />
      <View style={s.profileCard}>
        <View style={s.profileTop}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>{name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</Text>
            <View style={s.profileVerified}><Text style={s.profileVerifiedText}>✓</Text></View>
          </View>
          <View style={s.profileIdentity}>
            <Text style={s.profileName}>{name}</Text>
            <Text style={s.profileEmail}>{email}</Text>
            <View style={s.profileLocation}><Text style={s.profileLocationIcon}>📍</Text><Text style={s.profileLocationText}>{city ? ` ${city}, Sri Lanka` : ' Add your location'}</Text></View>
          </View>
          <Pressable style={s.editProfile} onPress={onEdit}><Text style={s.editProfileText}>Edit</Text></Pressable>
        </View>
        <View style={s.profileStats}>
          <View><Text style={s.profileStatNum}>03</Text><Text style={s.profileStatLabel}>COMMUNITIES</Text></View>
          <View style={s.profileStatDivider} />
          <View><Text style={s.profileStatNum}>{interests.length.toString().padStart(2, '0')}</Text><Text style={s.profileStatLabel}>SPORTS</Text></View>
          <View style={s.profileStatDivider} />
          <View><Text style={s.profileStatNum}>12</Text><Text style={s.profileStatLabel}>POSTS</Text></View>
        </View>
      </View>

      {/* Teams & Squads Card */}
      <View style={s.profileSectionHead}>
        <View><Text style={s.sectionTitle}>Team & Squad Management</Text><Text style={s.sectionSub}>Squad roster, invitations & challenges</Text></View>
      </View>
      <View style={s.teamsPromoCard}>
        <View style={s.teamsPromoHeader}>
          <Text style={s.teamsPromoTitle}>Club & Squad Hub</Text>
          <Text style={s.teamsPromoSub}>Manage player roster, invite new athletes, and challenge rival teams.</Text>
        </View>
        <TouchableOpacity style={s.openTeamsBtn} onPress={onOpenTeams}>
          <Text style={s.openTeamsBtnText}>Open Team & Squad Manager →</Text>
        </TouchableOpacity>
      </View>

      {/* Your Sports Preferences */}
      <View style={s.profileSectionHead}>
        <View><Text style={s.sectionTitle}>Your sports</Text><Text style={s.sectionSub}>Pick the games you want to follow and play</Text></View>
      </View>
      <View style={s.interestCard}>
        {sports.map((sport) => (
          <Pressable key={sport} onPress={() => onToggleInterest(sport)} style={[s.interestChip, interests.includes(sport) && s.interestChipSelected]}>
            <Text style={[s.interestChipText, interests.includes(sport) && s.interestChipTextSelected]}>
              {interests.includes(sport) ? '✓ ' : '+ '}{sport}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Workspaces Switcher */}
      <View style={s.profileSectionHead}>
        <View><Text style={s.sectionTitle}>Workspaces</Text><Text style={s.sectionSub}>Switch between your active roles</Text></View>
      </View>
      <View style={s.workspaceCard}>
        {workspaces.map((item, index) => {
          const hasRole = roles.includes(item.key);
          const application = applications.find((a) => a.role === item.key);
          const isSelected = workspace === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                if (hasRole) {
                  onWorkspace(item.key);
                  if (item.key === 'team_manager') onOpenTeams();
                  if (item.key === 'organizer') onOpenOrganizerWorkspace();
                } else if (item.key === 'organizer') {
                  onOpenOrganizerApp();
                } else {
                  onApply();
                }
              }}
              style={[s.workspaceRow, index < workspaces.length - 1 && s.workspaceRowBorder]}
            >
              <View style={[s.workspaceRoleIcon, isSelected && s.workspaceRoleIconSelected]}>
                <Text style={s.workspaceRoleGlyph}>{item.key === 'player' ? '👤' : item.key === 'team_manager' ? '👥' : '🏆'}</Text>
              </View>
              <View style={s.workspaceRowCopy}>
                <Text style={[s.workspaceRowTitle, !hasRole && s.workspaceDisabled]}>{item.label}</Text>
                <Text style={s.workspaceRowSubtitle}>{hasRole ? isSelected ? 'Active workspace' : 'Tap to switch' : application ? `${application.status} application` : 'Apply to unlock this workspace'}</Text>
              </View>
              {hasRole ? (
                <View style={[s.radio, isSelected && s.radioSelected]}>{isSelected && <View style={s.radioDot} />}</View>
              ) : (
                <Text style={application?.status === 'Pending' ? s.pendingText : s.workspaceLock}>{application?.status === 'Pending' ? 'PENDING' : '🔒'}</Text>
              )}
            </Pressable>
          );
        })}
        <Pressable style={s.applyRoleButton} onPress={onOpenOrganizerApp}>
          <View style={[s.applyPlus, { backgroundColor: '#D1FAE5' }]}><Text>🎫</Text></View>
          <View style={s.applyRoleCopy}>
            <Text style={s.applyRoleTitle}>Tournament Organizer Accreditation</Text>
            <Text style={s.applyRoleSub}>{roles.includes('organizer') ? 'Verified Organizer · View status & workspace' : 'Apply to host and sanction tournaments'}</Text>
          </View>
          <Text style={s.applyChevron}>→</Text>
        </Pressable>
        <Pressable style={s.applyRoleButton} onPress={onApply}>
          <View style={s.applyPlus}><Text>＋</Text></View>
          <View style={s.applyRoleCopy}>
            <Text style={s.applyRoleTitle}>{applications.some((a) => a.status === 'Pending') ? 'Apply for another role' : 'Grow into a new role'}</Text>
            <Text style={s.applyRoleSub}>Team manager or tournament organizer</Text>
          </View>
          <Text style={s.applyChevron}>→</Text>
        </Pressable>
      </View>

      <TouchableOpacity style={s.settingsCard} onPress={onOpenAlerts}>
        <View style={s.settingsIcon}><Text>🔔</Text></View>
        <View style={s.settingsCopy}><Text style={s.settingsTitle}>Notifications & Alerts</Text><Text style={s.settingsSubtitle}>View your match updates and alerts</Text></View>
        <Text style={s.settingsArrow}>→</Text>
      </TouchableOpacity>

      <Pressable style={s.signOutButton} onPress={onSignOut}><Text style={s.signOutText}>Sign out</Text></Pressable>
    </ScrollView>
  );
}

function PageIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <View style={s.pageIntro}>
      <Text style={s.kicker}>{eyebrow}</Text>
      <Text style={s.pageTitle}>{title}</Text>
      <Text style={s.subGreeting}>{subtitle}</Text>
    </View>
  );
}

// ── Modals ───────────────────────────────────────────────────────────────────
function ComposerModal({
  visible,
  value,
  onChange,
  onClose,
  onPublish,
  name,
}: {
  visible: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onPublish: () => void;
  name: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <View><Text style={s.sheetEyebrow}>COMMUNITY UPDATE</Text><Text style={s.sheetTitle}>Share your game</Text></View>
            <Pressable onPress={onClose} style={s.closeButton}><Text>✕</Text></Pressable>
          </View>
          <View style={s.sheetAuthor}>
            <View style={s.quickAvatar}><Text style={s.quickAvatarText}>{name[0]}</Text></View>
            <View><Text style={s.sheetAuthorName}>{name}</Text><Text style={s.sheetAuthorSub}>Sharing with your sports community</Text></View>
          </View>
          <TextInput
            style={s.composerInput}
            multiline
            value={value}
            onChangeText={onChange}
            placeholder="A win, a question, scores, or training updates..."
            placeholderTextColor={COLORS.placeholder}
            textAlignVertical="top"
            maxLength={2000}
          />
          <View style={s.composerTools}><Text style={s.composerTool}>●  General Community</Text><Text style={s.characterCount}>{value.length}/2000</Text></View>
          <Pressable style={[s.primaryButton, !value.trim() && s.disabledButton]} disabled={!value.trim()} onPress={onPublish}>
            <Text style={s.primaryButtonText}>Post to community →</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function NameModal({
  visible,
  name,
  setName,
  city,
  setCity,
  onClose,
  onSave,
}: {
  visible: boolean;
  name: string;
  setName: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.nameEditCard}>
          <View style={s.sheetHeader}>
            <View><Text style={s.sheetEyebrow}>YOUR PLAYER PROFILE</Text><Text style={s.sheetTitle}>Edit your profile</Text></View>
            <Pressable onPress={onClose} style={s.closeButton}><Text>✕</Text></Pressable>
          </View>
          <Text style={s.inputLabel}>DISPLAY NAME</Text>
          <TextInput style={s.textInput} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={COLORS.placeholder} autoCapitalize="words" />
          <Text style={s.inputLabel}>CITY</Text>
          <TextInput style={s.textInput} value={city} onChangeText={setCity} placeholder="e.g. Colombo" placeholderTextColor={COLORS.placeholder} autoCapitalize="words" />
          <Pressable style={[s.primaryButton, s.nameSaveButton]} onPress={onSave}>
            <Text style={s.primaryButtonText}>Save changes →</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ApplicationModal({
  visible,
  role,
  setRole,
  organization,
  setOrganization,
  experience,
  setExperience,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  role: Exclude<Workspace, 'player'>;
  setRole: (r: Exclude<Workspace, 'player'>) => void;
  organization: string;
  setOrganization: (v: string) => void;
  experience: string;
  setExperience: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <View><Text style={s.sheetEyebrow}>TAKE THE NEXT STEP</Text><Text style={s.sheetTitle}>Apply for a role</Text></View>
            <Pressable onPress={onClose} style={s.closeButton}><Text>✕</Text></Pressable>
          </View>
          <Text style={s.modalDescription}>Tell us about your background. Our team will review your application.</Text>
          <Text style={s.inputLabel}>I'M APPLYING AS A</Text>
          <View style={s.roleChoiceRow}>
            {workspaces.slice(1).map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setRole(item.key as Exclude<Workspace, 'player'>)}
                style={[s.roleChoice, role === item.key && s.roleChoiceActive]}
              >
                <Text style={[s.roleChoiceText, role === item.key && s.roleChoiceTextActive]}>
                  {item.key === 'team_manager' ? '👥  Team manager' : '🏆  Organizer'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.inputLabel}>TEAM OR ORGANIZATION</Text>
          <TextInput style={s.textInput} value={organization} onChangeText={setOrganization} placeholder="e.g. Colombo Falcons CC" placeholderTextColor={COLORS.placeholder} />
          <Text style={s.inputLabel}>YOUR EXPERIENCE</Text>
          <TextInput style={[s.textInput, s.experienceInput]} value={experience} onChangeText={setExperience} placeholder="Share your sports coaching, team management, or tournament hosting experience..." placeholderTextColor={COLORS.placeholder} multiline textAlignVertical="top" />
          <View style={s.reviewNotice}>
            <Text style={s.reviewNoticeIcon}>ℹ️</Text>
            <Text style={s.reviewNoticeText}>If approved, this role will unlock new management features on your account.</Text>
          </View>
          <Pressable style={s.primaryButton} onPress={onSubmit}>
            <Text style={s.primaryButtonText}>Send application →</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ReportModal({
  visible,
  reason,
  setReason,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  reason: string;
  setReason: (r: string) => void;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const reasons = ['Harassment or bullying', 'Spam or misleading content', 'Inappropriate content', 'Other'];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.confirmBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.confirmCard}>
          <View style={s.confirmIcon}><Text>⚐</Text></View>
          <Text style={s.confirmTitle}>Report this post</Text>
          <Text style={s.confirmDescription}>Choose the reason that best describes your concern. Reports are reviewed privately.</Text>
          <View style={{ marginTop: 10 }}>
            {reasons.map((item) => (
              <Pressable key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 8 }} onPress={() => setReason(item)}>
                <View style={[s.radio, reason === item && s.radioSelected]}>{reason === item && <View style={s.radioDot} />}</View>
                <Text style={{ color: '#596574', fontSize: 11 }}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <View style={s.confirmActions}>
            <Pressable style={s.confirmCancel} onPress={onClose}><Text style={s.confirmCancelText}>Cancel</Text></Pressable>
            <Pressable style={s.confirmSend} onPress={() => onSubmit(reason)}><Text style={s.confirmSendText}>Send report</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.paper },
  appFrame: { flex: 1, backgroundColor: COLORS.paper },
  header: {
    minHeight: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9E6E0',
    backgroundColor: COLORS.paper,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: '#D4B568',
    borderRadius: 10,
    backgroundColor: '#F2EBD8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brandMarkText: { color: COLORS.navy, fontSize: 19, fontWeight: '900', fontStyle: 'italic' },
  brandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4B568', position: 'absolute', right: 5, bottom: 5 },
  brandName: { color: COLORS.navy, fontSize: 18, fontWeight: '800', letterSpacing: -0.7 },
  brandGold: { color: '#B28A3D' },
  brandTag: { color: '#9A9588', fontSize: 7, letterSpacing: 1.1, marginTop: 1, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeWorkspace: {
    minHeight: 30,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 7,
    backgroundColor: '#F0EEE8',
  },
  activeWorkspaceText: { color: '#78643B', fontSize: 9, fontWeight: '700' },
  activeWorkspaceChevron: { color: '#A19376', fontSize: 12 },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EEE9',
    position: 'relative',
  },
  headerIconText: { fontSize: 16, color: '#596777' },
  noticeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D67669', borderWidth: 1, borderColor: COLORS.paper, position: 'absolute', top: 5, right: 5 },
  headerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCE8E0', borderWidth: 1, borderColor: '#C6D7CA' },
  headerAvatarText: { color: '#497458', fontSize: 10, fontWeight: '800' },

  // Scroll Content
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36 },
  greetingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  kicker: { color: '#99958B', letterSpacing: 1.1, fontSize: 9, fontWeight: '800' },
  greeting: { marginTop: 4, color: COLORS.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  wave: { fontSize: 18 },
  subGreeting: { marginTop: 3, color: '#8B939B', fontSize: 11 },
  dayChip: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F0EEE8', marginBottom: 2 },
  dayChipText: { color: '#78766F', fontSize: 9, fontWeight: '700' },

  // Hero Card
  heroCard: {
    minHeight: 185,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#17263B',
    marginBottom: 16,
  },
  heroGlow: { position: 'absolute', width: 210, height: 210, borderRadius: 105, right: -43, top: -30, backgroundColor: 'rgba(213,181,104,.13)' },
  heroEyebrow: { color: '#D6BC7F', fontSize: 8, letterSpacing: 1.35, fontWeight: '800' },
  heroTitle: { marginTop: 6, color: '#FFFDF6', fontSize: 26, lineHeight: 28, letterSpacing: -1, fontWeight: '800' },
  heroDescription: { marginTop: 6, maxWidth: 220, color: '#BCC5D0', fontSize: 10, lineHeight: 14 },
  heroButton: { alignSelf: 'flex-start', marginTop: 12, backgroundColor: '#D6B66B', borderRadius: 7, paddingVertical: 7, paddingHorizontal: 11 },
  heroButtonText: { color: '#283244', fontSize: 10, fontWeight: '700' },
  heroArrow: { fontSize: 12 },
  heroBall: {
    position: 'absolute',
    right: 22,
    top: 50,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(223,195,130,.62)',
    backgroundColor: 'rgba(229,205,151,.12)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-16deg' }],
  },
  heroBallText: { color: '#E2C578', fontSize: 36, fontWeight: '900', fontStyle: 'italic' },
  heroBallArc: { position: 'absolute', width: 68, height: 32, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(224,195,128,.65)', transform: [{ rotate: '53deg' }] },
  heroFoot: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,.12)',
    paddingTop: 8,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  heroFootStrong: { color: '#E9D49E', fontSize: 9, fontWeight: '700' },
  heroFootDivider: { color: '#8090A1', fontSize: 11 },

  // Hub Cards (All 4 Members)
  hubCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  hubCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEAE5',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  hubCardIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hubCardIcon: {
    fontSize: 18,
  },
  liveChip: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveChipText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '800',
  },
  openChip: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openChipText: {
    color: '#065F46',
    fontSize: 9,
    fontWeight: '800',
  },
  hubCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  hubCardSub: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
    marginBottom: 6,
  },
  hubCardLink: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },

  // Communities Strip
  sectionHead: { marginTop: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: COLORS.ink, fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  sectionSub: { marginTop: 2, color: '#9299A0', fontSize: 10 },
  sectionArrow: { color: '#059669', fontSize: 11, fontWeight: '700' },
  communityStrip: { paddingVertical: 4, paddingRight: 5, gap: 14 },
  communityBubbleWrap: { width: 56, alignItems: 'center' },
  communityBubble: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(50,60,70,.04)' },
  bubble_sand: { backgroundColor: '#F0E7D4' },
  bubble_blue: { backgroundColor: '#DEE9F1' },
  bubble_green: { backgroundColor: '#E0EDE4' },
  bubble_purple: { backgroundColor: '#EAE4F0' },
  communityEmoji: { fontSize: 20 },
  communityBubbleName: { marginTop: 4, color: '#6E7984', fontSize: 9, maxWidth: 56, textAlign: 'center' },
  addCommunityBubble: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: '#D0C6AD', backgroundColor: '#F4F1E9', alignItems: 'center', justifyContent: 'center' },
  addCommunityPlus: { color: '#9C844A', fontSize: 20, fontWeight: '300' },

  // Feed Section
  feedSectionHead: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  feedSort: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#E9E7E1', backgroundColor: '#FBFAF8' },
  feedSortText: { color: '#737D88', fontSize: 9, fontWeight: '600' },
  feedSortChevron: { color: '#959DA5', fontSize: 12 },
  quickCompose: { height: 46, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  quickAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DDEADF', alignItems: 'center', justifyContent: 'center' },
  quickAvatarText: { color: '#538060', fontSize: 11, fontWeight: '800' },
  quickPlaceholder: { flex: 1, color: '#9BA3AA', fontSize: 11 },
  quickPlus: { width: 24, height: 24, borderRadius: 7, backgroundColor: '#F4F1E8', alignItems: 'center', justifyContent: 'center' },
  quickPlusText: { color: '#A88747', fontSize: 16 },

  // Post Card
  postCard: { padding: 14, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF' },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postAvatar: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0E3D7' },
  postAvatarBlue: { backgroundColor: '#DCE8F4' },
  postAvatarRose: { backgroundColor: '#F1E0E5' },
  postAvatarText: { color: '#685D53', fontSize: 10, fontWeight: '800' },
  postAuthor: { flex: 1 },
  postAuthorName: { color: '#344051', fontSize: 12, fontWeight: '700' },
  postCommunity: { marginTop: 2, color: '#969EA6', fontSize: 10 },
  postMetaDot: { color: '#BDB5A4' },
  postMore: { paddingHorizontal: 5, paddingVertical: 2 },
  moreGlyph: { color: '#87919B', fontSize: 17, letterSpacing: 1 },
  postMenu: { position: 'absolute', top: 43, right: 11, zIndex: 3, paddingVertical: 4, borderRadius: 7, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF', shadowColor: '#102030', shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  postMenuItem: { paddingHorizontal: 12, paddingVertical: 9 },
  postMenuText: { color: '#697480', fontSize: 11 },
  postSportRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sportTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5, backgroundColor: '#F4F1E8' },
  sportTagDot: { color: '#B6934C', fontSize: 8 },
  sportTagText: { color: '#897342', fontSize: 10, fontWeight: '600' },
  postPublic: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5, backgroundColor: '#F6F7F8' },
  postPublicText: { color: '#9099A2', fontSize: 10 },
  postBody: { marginTop: 10, color: '#374151', fontSize: 13, lineHeight: 19 },
  postCounts: { marginTop: 12, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0EFEC' },
  postActions: { paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 4 },
  postActionIcon: { color: '#77838E', fontSize: 14 },
  likedIcon: { color: '#CF746B' },
  postActionText: { color: '#7D8791', fontSize: 11 },
  likedText: { color: '#BF7068' },
  feedEnd: { alignItems: 'center', paddingTop: 16, paddingBottom: 12 },
  feedEndStar: { color: '#D0AE63', fontSize: 16 },
  feedEndText: { marginTop: 4, color: '#717D88', fontSize: 11, fontWeight: '700' },
  feedEndSub: { marginTop: 3, color: '#A1A7AC', fontSize: 10 },

  commentComposer: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 9, borderTopWidth: 1, borderTopColor: '#F0EFEC' },
  commentInput: { flex: 1, height: 34, paddingHorizontal: 9, borderRadius: 7, borderWidth: 1, borderColor: '#E8E6E0', color: '#465363', fontSize: 11 },
  commentSend: { height: 34, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#293A50' },
  commentSendText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  // Community Sub Tabs
  communitySubTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  communitySubTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  communitySubTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
  },
  communitySubTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  communitySubTabTextActive: {
    color: '#059669',
    fontWeight: '700',
  },

  // ── Bottom Nav Bar (Matches Figma Screenshot Exactly) ──────────────────────
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 62,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#111827',
    fontWeight: '700',
  },

  // Discover & Profile Common
  pageIntro: { marginBottom: 16 },
  pageTitle: { marginTop: 5, color: COLORS.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.5 },
  discoverBanner: { padding: 16, borderRadius: 13, backgroundColor: '#E9EEE8', borderWidth: 1, borderColor: '#DFE7DE' },
  discoverBannerLabel: { color: '#64846D', fontSize: 9, letterSpacing: 1.1, fontWeight: '800' },
  discoverBannerTitle: { marginTop: 6, maxWidth: 240, color: '#243A2C', fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  discoverBannerText: { marginTop: 4, color: '#75867A', fontSize: 11 },
  fieldLabel: { marginTop: 16, marginBottom: 8, color: '#959A99', fontSize: 9, letterSpacing: 1, fontWeight: '800' },
  sportFilters: { gap: 7, paddingBottom: 2 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: '#EFEEE9' },
  filterChipActive: { backgroundColor: '#25364B' },
  filterChipText: { color: '#727B83', fontSize: 11, fontWeight: '600' },
  filterChipTextActive: { color: '#F7F5EF', fontWeight: '700' },
  discoverCard: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, marginBottom: 9, borderWidth: 1, borderColor: '#EBE9E4', borderRadius: 12, backgroundColor: '#FFF' },
  discoverIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  discoverEmoji: { fontSize: 20 },
  discoverInfo: { flex: 1 },
  discoverName: { color: '#344051', fontSize: 12, fontWeight: '700' },
  discoverMeta: { marginTop: 3, color: '#8C959E', fontSize: 10 },
  discoverMembers: { marginTop: 3, color: '#A1A8AE', fontSize: 9 },
  joinButton: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6, backgroundColor: '#273A53' },
  joinButtonText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  joinedButton: { backgroundColor: '#F1F3EF' },
  joinedButtonText: { color: '#758371' },

  // Alerts
  alertToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  alertCount: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertCountText: { color: '#7C8790', fontSize: 11 },
  alertCountDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D2AF61' },
  markReadText: { color: '#8D7647', fontSize: 11, fontWeight: '600' },
  notificationCard: { minHeight: 70, flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, marginBottom: 8, borderRadius: 10, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF' },
  notificationUnread: { backgroundColor: '#FFFEFA', borderColor: '#E9E2D3' },
  notificationIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  notifWelcome: { backgroundColor: '#F2EBD8' },
  notifLike: { backgroundColor: '#F6E6E3' },
  notifCommunity: { backgroundColor: '#E4EEE7' },
  notificationCopy: { flex: 1 },
  notificationTitle: { color: '#374354', fontSize: 11, fontWeight: '700' },
  notificationBody: { marginTop: 3, color: '#858F98', fontSize: 10, lineHeight: 14 },
  notificationTime: { marginTop: 4, color: '#A5ABB0', fontSize: 8 },
  unreadDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4, backgroundColor: '#D1AB5C' },

  // Profile Card
  profileCard: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#EAE8E2', backgroundColor: '#FFF', marginBottom: 14 },
  profileTop: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E1E9E0', position: 'relative' },
  profileAvatarText: { color: '#4D7257', fontSize: 16, fontWeight: '800' },
  profileVerified: { position: 'absolute', right: -3, bottom: -2, width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#FFF', backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' },
  profileVerifiedText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  profileIdentity: { flex: 1, paddingLeft: 12 },
  profileName: { color: '#111827', fontSize: 15, fontWeight: '800' },
  profileEmail: { marginTop: 3, color: '#6B7280', fontSize: 11 },
  profileLocation: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  profileLocationIcon: { fontSize: 10 },
  profileLocationText: { color: '#6B7280', fontSize: 10 },
  editProfile: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E7E6E1', borderRadius: 6 },
  editProfileText: { color: '#374151', fontSize: 11, fontWeight: '600' },
  profileStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0EFEB' },
  profileStatNum: { color: '#111827', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  profileStatLabel: { marginTop: 2, color: '#9CA3AF', fontSize: 8, letterSpacing: 0.5 },
  profileStatDivider: { height: 22, width: 1, backgroundColor: '#EEEDE9' },
  profileSectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },

  // Teams Promo Card (Member 2)
  teamsPromoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  teamsPromoHeader: {
    marginBottom: 10,
  },
  teamsPromoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 3,
  },
  teamsPromoSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  openTeamsBtn: {
    backgroundColor: '#059669',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  openTeamsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  interestCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF' },
  interestChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#E9E8E3', backgroundColor: '#FBFAF8' },
  interestChipSelected: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  interestChipText: { color: '#6B7280', fontSize: 11, fontWeight: '500' },
  interestChipTextSelected: { color: '#059669', fontWeight: '700' },

  workspaceCard: { paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF', marginTop: 4 },
  workspaceRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 },
  workspaceRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0EFEB' },
  workspaceRoleIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F1ED' },
  workspaceRoleIconSelected: { backgroundColor: '#ECFDF5' },
  workspaceRoleGlyph: { fontSize: 15 },
  workspaceRowCopy: { flex: 1 },
  workspaceRowTitle: { color: '#111827', fontSize: 12, fontWeight: '700' },
  workspaceRowSubtitle: { marginTop: 2, color: '#9CA3AF', fontSize: 10 },
  workspaceDisabled: { color: '#9CA3AF' },
  radio: { width: 16, height: 16, borderWidth: 1, borderColor: '#D5D8D9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#059669' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669' },
  workspaceLock: { fontSize: 13, paddingHorizontal: 2 },
  pendingText: { color: '#D97706', fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },
  applyRoleButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#F0EFEB' },
  applyPlus: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3EFE4' },
  applyRoleCopy: { flex: 1 },
  applyRoleTitle: { color: '#111827', fontSize: 11, fontWeight: '700' },
  applyRoleSub: { marginTop: 2, color: '#9CA3AF', fontSize: 9 },
  applyChevron: { color: '#9CA3AF', fontSize: 14 },
  settingsCard: { minHeight: 52, marginTop: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#ECEAE5', borderRadius: 10, backgroundColor: '#FFF' },
  settingsIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F1EF' },
  settingsCopy: { flex: 1 },
  settingsTitle: { color: '#374151', fontSize: 11, fontWeight: '700' },
  settingsSubtitle: { marginTop: 2, color: '#9CA3AF', fontSize: 9 },
  settingsArrow: { color: '#9CA3AF', fontSize: 14 },
  signOutButton: { alignItems: 'center', padding: 14, marginTop: 10 },
  signOutText: { color: '#DC2626', fontSize: 11, fontWeight: '700' },

  // Modals Sheet
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,25,38,.45)' },
  sheet: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#FFFFFF', maxHeight: '92%' },
  nameEditCard: { padding: 18, borderRadius: 16, backgroundColor: '#FFFFFF', margin: 20 },
  nameSaveButton: { marginTop: 14 },
  sheetHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 3, marginBottom: 12, backgroundColor: '#D1D5DB' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetEyebrow: { color: '#059669', fontSize: 9, letterSpacing: 1, fontWeight: '800' },
  sheetTitle: { marginTop: 4, color: '#111827', fontSize: 18, fontWeight: '800' },
  closeButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F3F4F6' },
  sheetAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 10 },
  sheetAuthorName: { color: '#111827', fontSize: 11, fontWeight: '700' },
  sheetAuthorSub: { marginTop: 2, color: '#9CA3AF', fontSize: 9 },
  composerInput: { minHeight: 110, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#FFF', color: '#111827', fontSize: 12, lineHeight: 18 },
  composerTools: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 },
  composerTool: { color: '#059669', fontSize: 10, fontWeight: '600' },
  characterCount: { color: '#9CA3AF', fontSize: 10 },
  primaryButton: { height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#111827' },
  primaryButtonText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  disabledButton: { backgroundColor: '#9CA3AF' },
  modalDescription: { marginTop: 6, marginBottom: 6, color: '#6B7280', fontSize: 11, lineHeight: 16 },
  roleChoiceRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  roleChoice: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#FFF' },
  roleChoiceActive: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  roleChoiceText: { color: '#4B5563', fontSize: 10, fontWeight: '600' },
  roleChoiceTextActive: { color: '#059669', fontWeight: '800' },
  experienceInput: { height: 80, paddingTop: 10 },
  reviewNotice: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10, marginTop: 10, marginBottom: 12, borderRadius: 8, backgroundColor: '#F3F4F6' },
  reviewNoticeIcon: { fontSize: 14 },
  reviewNoticeText: { flex: 1, color: '#4B5563', fontSize: 10, lineHeight: 14 },
  confirmBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(15,25,38,.5)' },
  confirmCard: { width: '100%', padding: 18, borderRadius: 14, backgroundColor: '#FFF' },
  confirmIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#FEE2E2' },
  confirmTitle: { marginTop: 10, color: '#111827', fontSize: 16, fontWeight: '800' },
  confirmDescription: { marginTop: 4, color: '#6B7280', fontSize: 11, lineHeight: 15 },
  confirmActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  confirmCancel: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8 },
  confirmCancelText: { color: '#4B5563', fontSize: 11, fontWeight: '600' },
  confirmSend: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#DC2626' },
  confirmSendText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  inputLabel: { marginTop: 10, marginBottom: 6, color: '#4B5563', fontSize: 9, letterSpacing: 0.8, fontWeight: '800' },
  textInput: { minHeight: 40, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, backgroundColor: '#FFF', paddingHorizontal: 12, color: '#111827', fontSize: 12 },
});
