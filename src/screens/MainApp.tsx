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

// ─── Helper ────────────────────────────────────────────────────────────────
function bubbleStyle(color: string) {
  if (color === 'blue') return s.bubble_blue;
  if (color === 'green') return s.bubble_green;
  if (color === 'purple') return s.bubble_purple;
  return s.bubble_sand;
}

// ─── Main App Shell ────────────────────────────────────────────────────────
export default function MainApp() {
  const {
    accessToken, refreshToken, userName, userEmail, userCity,
    roles, workspace, setWorkspace, signOut, setUserName, setUserCity, setRoles,
  } = useAuth();

  type Tab = 'Home' | 'Discover' | 'Alerts' | 'Profile';
  const [tab, setTab] = useState<Tab>('Home');
  const [posts, setPosts] = useState(startingPosts);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, FeedComment[]>>({});
  const [notifications, setNotifications] = useState(starterNotifications);
  const [communities, setCommunities] = useState(starterCommunities);
  const [interests, setInterests] = useState(['Cricket', 'Badminton', 'Running']);
  const [applications, setApplications] = useState<RoleApplication[]>([]);
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

  const firstName = userName.split(' ')[0];
  const unreadCount = notifications.filter((n) => n.unread).length;
  const joinedCount = useMemo(() => communities.filter((c) => c.joined).length, [communities]);
  const currentWorkspaceLabel = workspaces.find((w) => w.key === workspace)?.label ?? 'Player';

  // Fetch live data when authenticated
  useEffect(() => {
    if (!accessToken) return;
    apiRequest<Array<{ id: string; authorId: string; body: string; sport?: string; likesCount: number; commentsCount: number; createdAt: string }>>('/community/posts', {}, accessToken)
      .then((items) => setPosts(items.map((item) => ({
        id: item.id, author: 'SportLK player', initials: 'SP',
        community: item.sport ? `${item.sport} Community` : 'SportLK community',
        ago: 'Recently', sport: item.sport ?? 'Community', body: item.body,
        likes: item.likesCount, comments: item.commentsCount, liked: false,
      }))))
      .catch(() => undefined);

    apiRequest<Array<{ id: string; name: string; sport: string; location?: string; memberCount: number; isMember: boolean }>>('/communities', {}, accessToken)
      .then((items) => setCommunities(items.map((item) => ({
        id: item.id, name: item.name, sport: item.sport,
        location: item.location ?? 'Sri Lanka',
        members: item.memberCount >= 1000 ? `${(item.memberCount / 1000).toFixed(1)}k` : String(item.memberCount),
        initials: item.sport === 'Cricket' ? '🏏' : item.sport === 'Badminton' ? '🏸' : item.sport === 'Football' ? '⚽' : '◉',
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
        id: item.id, title: item.title, body: item.body, ago: 'Recently',
        unread: !item.readAt, kind: 'general',
      }))))
      .catch(() => undefined);

    apiRequest<Array<{ id: string; requestedRole: 'team_manager' | 'organizer'; status: 'pending' | 'approved' | 'rejected' }>>('/role-applications/mine', {}, accessToken)
      .then((items) => setApplications(items.map((item): RoleApplication => ({
        role: item.requestedRole,
        status: item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Declined' : 'Pending',
      }))))
      .catch(() => undefined);
  }, [accessToken]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  function toggleLike(id: string) {
    const selected = posts.find((p) => p.id === id);
    if (!selected) return;
    setPosts((items) => items.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
    if (accessToken && !id.startsWith('demo-')) {
      apiRequest(`/community/posts/${id}/like`, { method: 'POST' }, accessToken).catch(() => undefined);
    }
  }

  async function publishPost() {
    const body = newPost.trim();
    if (!body) return;
    const post: FeedPost = {
      id: `local-${Date.now()}`, author: userName,
      initials: userName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
      community: 'Your sports community', ago: 'Just now',
      sport: interests[0] ?? 'Community', body, likes: 0, comments: 0, liked: false,
    };
    setPosts((items) => [post, ...items]);
    setNewPost('');
    setComposerOpen(false);
    if (accessToken) {
      try {
        const saved = await apiRequest<{ id: string }>('/community/posts', {
          method: 'POST', body: JSON.stringify({ body, sport: post.sport }),
        }, accessToken);
        setPosts((items) => items.map((item) => item.id === post.id ? { ...item, id: saved.id } : item));
      } catch {
        Alert.alert('Post saved on this device', 'We could not sync this post to SportLK right now.');
      }
    }
  }

  async function submitComment(postId: string) {
    const body = commentText.trim();
    if (!body) return;
    setPosts((items) => items.map((p) => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setCommentsByPost((items) => ({ ...items, [postId]: [...(items[postId] ?? []), { author: userName, body }] }));
    if (accessToken && !postId.startsWith('demo-') && !postId.startsWith('local-')) {
      apiRequest(`/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ body }) }, accessToken).catch(() => undefined);
    }
    setCommentText('');
    setCommentingPost(null);
  }

  function openComments(postId: string) {
    setCommentingPost(commentingPost === postId ? null : postId);
    if (accessToken && !postId.startsWith('demo-') && !postId.startsWith('local-')) {
      apiRequest<Array<{ id: string; authorId: string; body: string }>>(`/community/posts/${postId}/comments`, {}, accessToken)
        .then((items) => setCommentsByPost((c) => ({ ...c, [postId]: items.map((i) => ({ author: 'SportLK player', body: i.body })) })))
        .catch(() => undefined);
    }
  }

  async function submitReport(reason: string) {
    if (!reportingPost) return;
    if (accessToken && !reportingPost.id.startsWith('demo-') && !reportingPost.id.startsWith('local-')) {
      try {
        await apiRequest('/reports', {
          method: 'POST',
          body: JSON.stringify({ targetType: 'post', targetId: reportingPost.id, reason }),
        }, accessToken);
      } catch {
        Alert.alert('Report not sent', 'Please try again when you have a connection.');
        return;
      }
    }
    Alert.alert('Report received', 'Thanks for helping keep the SportLK community welcoming.');
    setReportingPost(null);
  }

  async function submitApplication() {
    if (!organization.trim() || experience.trim().length < 20) {
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={s.appFrame}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <View style={s.brandMark}><Text style={s.brandMarkText}>S</Text><View style={s.brandDot} /></View>
            <View><Text style={s.brandName}>Sport<Text style={s.brandGold}>LK</Text></Text><Text style={s.brandTag}>YOUR GAME. YOUR PEOPLE.</Text></View>
          </View>
          <View style={s.headerActions}>
            <Pressable style={s.activeWorkspace} onPress={() => setTab('Profile')}>
              <Text style={s.activeWorkspaceText}>{currentWorkspaceLabel}</Text>
              <Text style={s.activeWorkspaceChevron}>⌄</Text>
            </Pressable>
            <Pressable style={s.headerIcon} onPress={() => setTab('Alerts')}>
              <Text style={s.headerIconText}>♧</Text>
              {unreadCount > 0 && <View style={s.noticeDot} />}
            </Pressable>
            <Pressable style={s.headerAvatar} onPress={() => setTab('Profile')}>
              <Text style={s.headerAvatarText}>{userName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</Text>
            </Pressable>
          </View>
        </View>

        {/* Tab content */}
        {tab === 'Home' && (
          <HomeFeed
            firstName={firstName} posts={posts} commentsByPost={commentsByPost}
            communities={communities} joinedCount={joinedCount}
            onCompose={() => setComposerOpen(true)} onDiscover={() => setTab('Discover')}
            onLike={toggleLike} onReport={setReportingPost} onComment={openComments}
            commentingPost={commentingPost} commentText={commentText}
            setCommentText={setCommentText} onSubmitComment={submitComment}
          />
        )}
        {tab === 'Discover' && (
          <Discover communities={communities} setCommunities={setCommunities} accessToken={accessToken} />
        )}
        {tab === 'Alerts' && (
          <Alerts notifications={notifications} setNotifications={setNotifications}
            onMarkAll={markAllRead}
            onRead={(id) => { if (accessToken) apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }, accessToken).catch(() => undefined); }}
          />
        )}
        {tab === 'Profile' && (
          <Profile
            name={userName} email={userEmail} city={userCity}
            interests={interests} roles={roles} workspace={workspace}
            applications={applications} onToggleInterest={toggleInterest}
            onWorkspace={setWorkspace} onApply={() => setApplicationOpen(true)}
            onEdit={() => { setProfileNameDraft(userName); setProfileCityDraft(userCity); setProfileEditOpen(true); }}
            onSignOut={signOut}
          />
        )}

        {/* Bottom nav */}
        <View style={s.bottomNav}>
          <TabButton icon="⌂" label="Home" active={tab === 'Home'} onPress={() => setTab('Home')} />
          <TabButton icon="◉" label="Discover" active={tab === 'Discover'} onPress={() => setTab('Discover')} />
          <TabButton icon="♧" label="Alerts" active={tab === 'Alerts'} onPress={() => setTab('Alerts')} badge={unreadCount} />
          <TabButton icon="♙" label="Profile" active={tab === 'Profile'} onPress={() => setTab('Profile')} />
        </View>
      </View>

      {/* Modals */}
      <ComposerModal visible={composerOpen} value={newPost} onChange={setNewPost} onClose={() => setComposerOpen(false)} onPublish={publishPost} name={userName} />
      <ApplicationModal visible={applicationOpen} role={roleChoice} setRole={setRoleChoice} organization={organization} setOrganization={setOrganization} experience={experience} setExperience={setExperience} onClose={() => setApplicationOpen(false)} onSubmit={submitApplication} />
      <NameModal
        visible={profileEditOpen} name={profileNameDraft} setName={setProfileNameDraft}
        city={profileCityDraft} setCity={setProfileCityDraft}
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
      <ReportModal visible={Boolean(reportingPost)} reason={reportReason} setReason={setReportReason} onClose={() => setReportingPost(null)} onSubmit={submitReport} />
    </SafeAreaView>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function HomeFeed({ firstName, posts, commentsByPost, communities, joinedCount, onCompose, onDiscover, onLike, onReport, onComment, commentingPost, commentText, setCommentText, onSubmitComment }: {
  firstName: string; posts: FeedPost[]; commentsByPost: Record<string, FeedComment[]>;
  communities: Community[]; joinedCount: number; onCompose: () => void; onDiscover: () => void;
  onLike: (id: string) => void; onReport: (post: FeedPost) => void; onComment: (id: string) => void;
  commentingPost: string | null; commentText: string; setCommentText: (v: string) => void; onSubmitComment: (id: string) => void;
}) {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={s.greetingRow}>
        <View>
          <Text style={s.kicker}>SUNDAY, OCTOBER 11</Text>
          <Text style={s.greeting}>Good morning, {firstName} <Text style={s.wave}>☀</Text></Text>
          <Text style={s.subGreeting}>Ready to get moving today?</Text>
        </View>
        <View style={s.dayChip}><Text style={s.dayChipText}>LK · 32°</Text></View>
      </View>

      <View style={s.heroCard}>
        <View style={s.heroGlow} />
        <View><Text style={s.heroEyebrow}>THE SPORTLK COMMUNITY</Text>
          <Text style={s.heroTitle}>Your game.{"\n"}Your people.</Text>
          <Text style={s.heroDescription}>Find your team, share your wins, and play more.</Text>
          <Pressable style={s.heroButton} onPress={onCompose}><Text style={s.heroButtonText}>Share an update <Text style={s.heroArrow}>↗</Text></Text></Pressable>
        </View>
        <View style={s.heroBall}><Text style={s.heroBallText}>S</Text><View style={s.heroBallArc} /></View>
        <View style={s.heroFoot}>
          <Text style={s.heroFootStrong}>{joinedCount} communities</Text>
          <Text style={s.heroFootDivider}>·</Text>
          <Text>made for your game</Text>
        </View>
      </View>

      <View style={s.sectionHead}>
        <View><Text style={s.sectionTitle}>Your communities</Text><Text style={s.sectionSub}>A little closer to your people</Text></View>
        <Text style={s.sectionArrow}>→</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.communityStrip}>
        {communities.filter((c) => c.joined).map((c) => (
          <View style={s.communityBubbleWrap} key={c.id}>
            <View style={[s.communityBubble, bubbleStyle(c.color)]}><Text style={s.communityEmoji}>{c.initials}</Text></View>
            <Text style={s.communityBubbleName} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
          </View>
        ))}
        <Pressable style={s.communityBubbleWrap} onPress={onDiscover}>
          <View style={s.addCommunityBubble}><Text style={s.addCommunityPlus}>＋</Text></View>
          <Text style={s.communityBubbleName}>Discover</Text>
        </Pressable>
      </ScrollView>

      <View style={s.feedSectionHead}>
        <View><Text style={s.sectionTitle}>Community feed</Text><Text style={s.sectionSub}>Good things are happening out there</Text></View>
        <View style={s.feedSort}><Text style={s.feedSortText}>For you</Text><Text style={s.feedSortChevron}>⌄</Text></View>
      </View>
      <Pressable style={s.quickCompose} onPress={onCompose}>
        <View style={s.quickAvatar}><Text style={s.quickAvatarText}>{firstName.slice(0, 1)}</Text></View>
        <Text style={s.quickPlaceholder}>What's happening in your game?</Text>
        <View style={s.quickPlus}><Text style={s.quickPlusText}>＋</Text></View>
      </Pressable>

      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} comments={commentsByPost[post.id] ?? []} index={index}
          onLike={() => onLike(post.id)} onReport={() => onReport(post)} onComment={() => onComment(post.id)}
          commenting={commentingPost === post.id} commentText={commentText}
          setCommentText={setCommentText} onSubmitComment={() => onSubmitComment(post.id)}
        />
      ))}
      <View style={s.feedEnd}><Text style={s.feedEndStar}>✦</Text><Text style={s.feedEndText}>You're all caught up</Text><Text style={s.feedEndSub}>Go make a little more sport happen.</Text></View>
    </ScrollView>
  );
}

function PostCard({ post, comments, index, onLike, onReport, onComment, commenting, commentText, setCommentText, onSubmitComment }: {
  post: FeedPost; comments: FeedComment[]; index: number; onLike: () => void; onReport: () => void; onComment: () => void;
  commenting: boolean; commentText: string; setCommentText: (v: string) => void; onSubmitComment: () => void;
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
        <Pressable style={s.postMore} onPress={() => setMenuOpen(!menuOpen)}><Text style={s.moreGlyph}>···</Text></Pressable>
      </View>
      {menuOpen && (
        <View style={s.postMenu}>
          <Pressable style={s.postMenuItem} onPress={() => { setMenuOpen(false); onReport(); }}>
            <Text style={s.postMenuText}>⚑  Report post</Text>
          </Pressable>
        </View>
      )}
      <View style={s.postSportRow}>
        <View style={s.sportTag}><Text style={s.sportTagDot}>●</Text><Text style={s.sportTagText}>{post.sport}</Text></View>
        <View style={s.postPublic}><Text style={s.postPublicText}>◉  Community</Text></View>
      </View>
      <Text style={s.postBody}>{post.body}</Text>
      <View style={s.postCounts}><Text>{post.likes} appreciations</Text><Text>{post.comments} comments</Text></View>
      <View style={s.postActions}>
        <Pressable style={s.postAction} onPress={onLike}>
          <Text style={[s.postActionIcon, post.liked && s.likedIcon]}>{post.liked ? '♥' : '♡'}</Text>
          <Text style={[s.postActionText, post.liked && s.likedText]}>{post.liked ? 'Appreciated' : 'Appreciate'}</Text>
        </Pressable>
        <Pressable style={s.postAction} onPress={onComment}>
          <Text style={s.postActionIcon}>◌</Text><Text style={s.postActionText}>Comment</Text>
        </Pressable>
        <Pressable style={s.postAction} onPress={() => Alert.alert('Share this post', 'Sharing links will be available soon.')}>
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
          <TextInput style={s.commentInput} value={commentText} onChangeText={setCommentText} placeholder="Write a thoughtful comment…" placeholderTextColor={COLORS.placeholder} />
          <Pressable disabled={!commentText.trim()} onPress={onSubmitComment} style={s.commentSend}>
            <Text style={s.commentSendText}>Send</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Discover({ communities, setCommunities, accessToken }: {
  communities: Community[]; setCommunities: React.Dispatch<React.SetStateAction<Community[]>>; accessToken?: string;
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
        <Text style={s.sectionArrow}>⌖</Text>
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
      <View style={s.bottomHint}>
        <Text style={s.bottomHintText}>Looking for a group that isn't here?</Text>
        <Text style={s.bottomHintLink}>Start a community  →</Text>
      </View>
    </ScrollView>
  );
}

function Alerts({ notifications, setNotifications, onMarkAll, onRead }: {
  notifications: Notification[]; setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onMarkAll: () => void; onRead: (id: string) => void;
}) {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <PageIntro eyebrow="STAY IN THE LOOP" title="Your notifications" subtitle="The good stuff happening around your game." />
      <View style={s.alertToolbar}>
        <View style={s.alertCount}><View style={s.alertCountDot} /><Text style={s.alertCountText}>{notifications.filter((n) => n.unread).length} unread</Text></View>
        <Pressable onPress={onMarkAll}><Text style={s.markReadText}>Mark all as read</Text></Pressable>
      </View>
      <Text style={s.notificationDay}>TODAY</Text>
      {notifications.map((n, index) => (
        <Pressable key={n.id} style={[s.notificationCard, n.unread && s.notificationUnread]}
          onPress={() => { setNotifications((items) => items.map((i) => i.id === n.id ? { ...i, unread: false } : i)); onRead(n.id); }}>
          <View style={[s.notificationIcon, index === 0 ? s.notifWelcome : index === 1 ? s.notifLike : s.notifCommunity]}>
            <Text>{index === 0 ? '✦' : index === 1 ? '♥' : '◉'}</Text>
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

function Profile({ name, email, city, interests, roles, workspace, applications, onToggleInterest, onWorkspace, onApply, onEdit, onSignOut }: {
  name: string; email: string; city: string; interests: string[]; roles: Workspace[]; workspace: Workspace;
  applications: RoleApplication[]; onToggleInterest: (sport: string) => void; onWorkspace: (w: Workspace) => void;
  onApply: () => void; onEdit: () => void; onSignOut: () => void;
}) {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <PageIntro eyebrow="YOUR SPORTLK" title="Your profile" subtitle="A little about you, and the games you love." />
      <View style={s.profileCard}>
        <View style={s.profileTop}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>{name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</Text>
            <View style={s.profileVerified}><Text style={s.profileVerifiedText}>✓</Text></View>
          </View>
          <View style={s.profileIdentity}>
            <Text style={s.profileName}>{name}</Text>
            <Text style={s.profileEmail}>{email}</Text>
            <View style={s.profileLocation}><Text style={s.profileLocationIcon}>⌖</Text><Text style={s.profileLocationText}>{city ? ` ${city}, Sri Lanka` : ' Add your location'}</Text></View>
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

      <View style={s.profileSectionHead}>
        <View><Text style={s.sectionTitle}>Your sports</Text><Text style={s.sectionSub}>Pick the games you want to see more of</Text></View>
        <Text style={s.editPencil}>✎</Text>
      </View>
      <View style={s.interestCard}>
        {sports.map((sport) => (
          <Pressable key={sport} onPress={() => onToggleInterest(sport)} style={[s.interestChip, interests.includes(sport) && s.interestChipSelected]}>
            <Text style={[s.interestChipText, interests.includes(sport) && s.interestChipTextSelected]}>{interests.includes(sport) ? '✓  ' : '+  '}{sport}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.profileSectionHead}>
        <View><Text style={s.sectionTitle}>Workspaces</Text><Text style={s.sectionSub}>Switch between your SportLK roles</Text></View>
      </View>
      <View style={s.workspaceCard}>
        {workspaces.map((item, index) => {
          const hasRole = roles.includes(item.key);
          const application = applications.find((a) => a.role === item.key);
          const isSelected = workspace === item.key;
          return (
            <Pressable key={item.key} disabled={!hasRole} onPress={() => onWorkspace(item.key)}
              style={[s.workspaceRow, index < workspaces.length - 1 && s.workspaceRowBorder]}>
              <View style={[s.workspaceRoleIcon, isSelected && s.workspaceRoleIconSelected]}>
                <Text style={s.workspaceRoleGlyph}>{item.key === 'player' ? '♙' : item.key === 'team_manager' ? '♧' : '▦'}</Text>
              </View>
              <View style={s.workspaceRowCopy}>
                <Text style={[s.workspaceRowTitle, !hasRole && s.workspaceDisabled]}>{item.label}</Text>
                <Text style={s.workspaceRowSubtitle}>{hasRole ? isSelected ? 'Current workspace' : 'Available to switch' : application ? `${application.status} application` : 'Apply to unlock this workspace'}</Text>
              </View>
              {hasRole ? (
                <View style={[s.radio, isSelected && s.radioSelected]}>{isSelected && <View style={s.radioDot} />}</View>
              ) : (
                <Text style={application?.status === 'Pending' ? s.pendingText : s.workspaceLock}>{application?.status === 'Pending' ? 'PENDING' : '⌑'}</Text>
              )}
            </Pressable>
          );
        })}
        <Pressable style={s.applyRoleButton} onPress={onApply}>
          <View style={s.applyPlus}><Text>＋</Text></View>
          <View style={s.applyRoleCopy}>
            <Text style={s.applyRoleTitle}>{applications.some((a) => a.status === 'Pending') ? 'Apply for another role' : 'Grow into a new role'}</Text>
            <Text style={s.applyRoleSub}>Team manager or tournament organizer</Text>
          </View>
          <Text style={s.applyChevron}>→</Text>
        </Pressable>
      </View>

      <View style={s.settingsCard}>
        <View style={s.settingsIcon}><Text>⚙</Text></View>
        <View style={s.settingsCopy}><Text style={s.settingsTitle}>Account & privacy</Text><Text style={s.settingsSubtitle}>Your login and safety preferences</Text></View>
        <Text style={s.settingsArrow}>→</Text>
      </View>
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

type TabLabel = 'Home' | 'Discover' | 'Alerts' | 'Profile';
function TabButton({ icon, label, active, badge, onPress }: { icon: string; label: TabLabel; active: boolean; badge?: number; onPress: () => void }) {
  return (
    <Pressable style={s.tabButton} onPress={onPress}>
      <View style={s.tabIconWrap}>
        <Text style={[s.tabIcon, active && s.tabIconActive]}>{icon}</Text>
        {Boolean(badge) && <View style={s.tabBadge} />}
      </View>
      <Text style={[s.tabLabel, active && s.tabLabelActive]}>{label}</Text>
      {active && <View style={s.tabActiveLine} />}
    </Pressable>
  );
}

// ─── Modals ──────────────────────────────────────────────────────────────────
function ComposerModal({ visible, value, onChange, onClose, onPublish, name }: {
  visible: boolean; value: string; onChange: (v: string) => void; onClose: () => void; onPublish: () => void; name: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <View><Text style={s.sheetEyebrow}>COMMUNITY UPDATE</Text><Text style={s.sheetTitle}>Share your game</Text></View>
            <Pressable onPress={onClose} style={s.closeButton}><Text>×</Text></Pressable>
          </View>
          <View style={s.sheetAuthor}>
            <View style={s.quickAvatar}><Text style={s.quickAvatarText}>{name[0]}</Text></View>
            <View><Text style={s.sheetAuthorName}>{name}</Text><Text style={s.sheetAuthorSub}>Sharing with your sports community</Text></View>
          </View>
          <TextInput style={s.composerInput} multiline value={value} onChangeText={onChange} placeholder="A win, a question, a game to play…" placeholderTextColor={COLORS.placeholder} textAlignVertical="top" maxLength={2000} />
          <View style={s.composerTools}><Text style={s.composerTool}>◉  Add a sport</Text><Text style={s.characterCount}>{value.length}/2000</Text></View>
          <Pressable style={[s.primaryButton, !value.trim() && s.disabledButton]} disabled={!value.trim()} onPress={onPublish}>
            <Text style={s.primaryButtonText}>Post to community  →</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function NameModal({ visible, name, setName, city, setCity, onClose, onSave }: {
  visible: boolean; name: string; setName: (v: string) => void; city: string; setCity: (v: string) => void; onClose: () => void; onSave: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.nameEditCard}>
          <View style={s.sheetHeader}>
            <View><Text style={s.sheetEyebrow}>YOUR PLAYER PROFILE</Text><Text style={s.sheetTitle}>Edit your profile</Text></View>
            <Pressable onPress={onClose} style={s.closeButton}><Text>×</Text></Pressable>
          </View>
          <Text style={s.inputLabel}>DISPLAY NAME</Text>
          <TextInput style={s.textInput} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={COLORS.placeholder} autoCapitalize="words" />
          <Text style={s.inputLabel}>CITY</Text>
          <TextInput style={s.textInput} value={city} onChangeText={setCity} placeholder="e.g. Colombo" placeholderTextColor={COLORS.placeholder} autoCapitalize="words" />
          <Pressable style={[s.primaryButton, s.nameSaveButton]} onPress={onSave}>
            <Text style={s.primaryButtonText}>Save changes  →</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ApplicationModal({ visible, role, setRole, organization, setOrganization, experience, setExperience, onClose, onSubmit }: {
  visible: boolean; role: Exclude<Workspace, 'player'>; setRole: (r: Exclude<Workspace, 'player'>) => void;
  organization: string; setOrganization: (v: string) => void; experience: string; setExperience: (v: string) => void;
  onClose: () => void; onSubmit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <View><Text style={s.sheetEyebrow}>TAKE THE NEXT STEP</Text><Text style={s.sheetTitle}>Apply for a role</Text></View>
            <Pressable onPress={onClose} style={s.closeButton}><Text>×</Text></Pressable>
          </View>
          <Text style={s.modalDescription}>Tell us a little about your experience. Our team will review your application.</Text>
          <Text style={s.inputLabel}>I'M APPLYING AS A</Text>
          <View style={s.roleChoiceRow}>
            {workspaces.slice(1).map((item) => (
              <Pressable key={item.key} onPress={() => setRole(item.key as Exclude<Workspace, 'player'>)}
                style={[s.roleChoice, role === item.key && s.roleChoiceActive]}>
                <Text style={[s.roleChoiceText, role === item.key && s.roleChoiceTextActive]}>{item.key === 'team_manager' ? '♧  Team manager' : '▦  Organizer'}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.inputLabel}>TEAM OR ORGANIZATION</Text>
          <TextInput style={s.textInput} value={organization} onChangeText={setOrganization} placeholder="e.g. Colombo Strikers" placeholderTextColor={COLORS.placeholder} />
          <Text style={s.inputLabel}>YOUR EXPERIENCE</Text>
          <TextInput style={[s.textInput, s.experienceInput]} value={experience} onChangeText={setExperience} placeholder="Share your experience…" placeholderTextColor={COLORS.placeholder} multiline textAlignVertical="top" />
          <View style={s.reviewNotice}><Text style={s.reviewNoticeIcon}>ⓘ</Text><Text style={s.reviewNoticeText}>If approved, this role will appear as a new workspace on your profile.</Text></View>
          <Pressable style={s.primaryButton} onPress={onSubmit}><Text style={s.primaryButtonText}>Send application  →</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ReportModal({ visible, reason, setReason, onClose, onSubmit }: {
  visible: boolean; reason: string; setReason: (r: string) => void; onClose: () => void; onSubmit: (reason: string) => void;
}) {
  const reasons = ['Harassment or bullying', 'Spam or misleading content', 'Inappropriate content', 'Other'];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.confirmBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.confirmCard}>
          <View style={s.confirmIcon}><Text>⚑</Text></View>
          <Text style={s.confirmTitle}>Report this post</Text>
          <Text style={s.confirmDescription}>Choose the reason that best describes your concern. Reports are private.</Text>
          <View style={{ marginTop: 10 }}>
            {reasons.map((item) => (
              <Pressable key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 8 }} onPress={() => setReason(item)}>
                <View style={[s.radio, reason === item && s.radioSelected]}>{reason === item && <View style={s.radioDot} />}</View>
                <Text style={{ color: '#596574', fontSize: 9 }}>{item}</Text>
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

// ─── All styles (ported 1:1 from original App.tsx) ──────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.paper }, appFrame: { flex: 1, backgroundColor: COLORS.paper },
  header: { minHeight: 61, paddingHorizontal: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E9E6E0', backgroundColor: COLORS.paper },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandMark: { width: 34, height: 34, borderWidth: 1, borderColor: '#D4B568', borderRadius: 10, backgroundColor: '#F2EBD8', alignItems: 'center', justifyContent: 'center', position: 'relative' }, brandMarkText: { color: COLORS.navy, fontSize: 19, fontWeight: '900', fontStyle: 'italic' }, brandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4B568', position: 'absolute', right: 5, bottom: 5 }, brandName: { color: COLORS.navy, fontSize: 18, fontWeight: '800', letterSpacing: -0.7 }, brandGold: { color: '#B28A3D' }, brandTag: { color: '#9A9588', fontSize: 7, letterSpacing: 1.1, marginTop: 1, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, activeWorkspace: { minHeight: 30, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 7, backgroundColor: '#F0EEE8' }, activeWorkspaceText: { color: '#78643B', fontSize: 8, fontWeight: '700' }, activeWorkspaceChevron: { color: '#A19376', fontSize: 12 }, headerIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0EEE9', position: 'relative' }, headerIconText: { fontSize: 18, color: '#596777' }, noticeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D67669', borderWidth: 1, borderColor: COLORS.paper, position: 'absolute', top: 5, right: 5 }, headerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCE8E0', borderWidth: 1, borderColor: '#C6D7CA' }, headerAvatarText: { color: '#497458', fontSize: 10, fontWeight: '800' },
  scroll: { flex: 1 }, scrollContent: { paddingHorizontal: 19, paddingTop: 18, paddingBottom: 37 }, greetingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 17 }, kicker: { color: '#99958B', letterSpacing: 1.1, fontSize: 8, fontWeight: '800' }, greeting: { marginTop: 6, color: COLORS.ink, fontSize: 21, fontWeight: '700', letterSpacing: -0.7 }, wave: { color: '#D2A747', fontSize: 18 }, subGreeting: { marginTop: 4, color: '#8B939B', fontSize: 10 }, dayChip: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F0EEE8', marginBottom: 2 }, dayChipText: { color: '#78766F', fontSize: 8, fontWeight: '700' },
  heroCard: { minHeight: 205, overflow: 'hidden', position: 'relative', borderRadius: 17, paddingHorizontal: 19, paddingTop: 18, paddingBottom: 13, backgroundColor: '#17263B' }, heroGlow: { position: 'absolute', width: 210, height: 210, borderRadius: 105, right: -43, top: -30, backgroundColor: 'rgba(213,181,104,.13)' }, heroEyebrow: { color: '#D6BC7F', fontSize: 8, letterSpacing: 1.35, fontWeight: '800' }, heroTitle: { marginTop: 8, color: '#FFFDF6', fontSize: 28, lineHeight: 30, letterSpacing: -1.1, fontWeight: '800' }, heroDescription: { marginTop: 7, maxWidth: 220, color: '#BCC5D0', fontSize: 9, lineHeight: 14 }, heroButton: { alignSelf: 'flex-start', marginTop: 13, backgroundColor: '#D6B66B', borderRadius: 7, paddingVertical: 8, paddingHorizontal: 11 }, heroButtonText: { color: '#283244', fontSize: 9, fontWeight: '700' }, heroArrow: { fontSize: 12 }, heroBall: { position: 'absolute', right: 29, top: 61, width: 79, height: 79, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(223,195,130,.62)', backgroundColor: 'rgba(229,205,151,.12)', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-16deg' }] }, heroBallText: { color: '#E2C578', fontSize: 41, fontWeight: '900', fontStyle: 'italic' }, heroBallArc: { position: 'absolute', width: 72, height: 34, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(224,195,128,.65)', transform: [{ rotate: '53deg' }] }, heroFoot: { position: 'absolute', left: 19, right: 19, bottom: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.12)', paddingTop: 9, flexDirection: 'row', gap: 7, alignItems: 'center' }, heroFootStrong: { color: '#E9D49E', fontSize: 8, fontWeight: '700' }, heroFootDivider: { color: '#8090A1', fontSize: 11 },
  sectionHead: { marginTop: 23, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: COLORS.ink, fontSize: 13, fontWeight: '700', letterSpacing: -0.2 }, sectionSub: { marginTop: 3, color: '#9299A0', fontSize: 9 }, sectionArrow: { color: '#8F98A2', fontSize: 17, paddingRight: 3 }, communityStrip: { paddingVertical: 3, paddingRight: 5, gap: 17 }, communityBubbleWrap: { width: 57, alignItems: 'center' }, communityBubble: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(50,60,70,.04)' }, bubble_sand: { backgroundColor: '#F0E7D4' }, bubble_blue: { backgroundColor: '#DEE9F1' }, bubble_green: { backgroundColor: '#E0EDE4' }, bubble_purple: { backgroundColor: '#EAE4F0' }, communityEmoji: { fontSize: 20 }, communityBubbleName: { marginTop: 5, color: '#6E7984', fontSize: 8, maxWidth: 57 }, addCommunityBubble: { width: 48, height: 48, borderRadius: 17, borderWidth: 1, borderStyle: 'dashed', borderColor: '#D0C6AD', backgroundColor: '#F4F1E9', alignItems: 'center', justifyContent: 'center' }, addCommunityPlus: { color: '#9C844A', fontSize: 21, fontWeight: '300' },
  feedSectionHead: { marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }, feedSort: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#E9E7E1', backgroundColor: '#FBFAF8' }, feedSortText: { color: '#737D88', fontSize: 8, fontWeight: '600' }, feedSortChevron: { color: '#959DA5', fontSize: 12 }, quickCompose: { height: 47, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }, quickAvatar: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#DDEADF', alignItems: 'center', justifyContent: 'center' }, quickAvatarText: { color: '#538060', fontSize: 10, fontWeight: '800' }, quickPlaceholder: { flex: 1, color: '#9BA3AA', fontSize: 9 }, quickPlus: { width: 24, height: 24, borderRadius: 7, backgroundColor: '#F4F1E8', alignItems: 'center', justifyContent: 'center' }, quickPlusText: { color: '#A88747', fontSize: 16 },
  postCard: { padding: 12, marginBottom: 10, borderRadius: 11, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF' }, postHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 }, postAvatar: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0E3D7' }, postAvatarBlue: { backgroundColor: '#DCE8F4' }, postAvatarRose: { backgroundColor: '#F1E0E5' }, postAvatarText: { color: '#685D53', fontSize: 9, fontWeight: '800' }, postAuthor: { flex: 1 }, postAuthorName: { color: '#344051', fontSize: 10, fontWeight: '700' }, postCommunity: { marginTop: 3, color: '#969EA6', fontSize: 8 }, postMetaDot: { color: '#BDB5A4' }, postMore: { paddingHorizontal: 5, paddingVertical: 2 }, moreGlyph: { color: '#87919B', fontSize: 17, letterSpacing: 1 }, postMenu: { position: 'absolute', top: 43, right: 11, zIndex: 3, paddingVertical: 4, borderRadius: 7, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF', shadowColor: '#102030', shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 }, postMenuItem: { paddingHorizontal: 12, paddingVertical: 9 }, postMenuText: { color: '#697480', fontSize: 9 }, postSportRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sportTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 5, backgroundColor: '#F4F1E8' }, sportTagDot: { color: '#B6934C', fontSize: 6 }, sportTagText: { color: '#897342', fontSize: 8, fontWeight: '600' }, postPublic: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5, backgroundColor: '#F6F7F8' }, postPublicText: { color: '#9099A2', fontSize: 8 }, postBody: { marginTop: 10, color: '#4E5966', fontSize: 10, lineHeight: 16 }, postCounts: { marginTop: 12, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0EFEC' }, postActions: { paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }, postAction: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 3, paddingHorizontal: 3 }, postActionIcon: { color: '#77838E', fontSize: 15 }, likedIcon: { color: '#CF746B' }, postActionText: { color: '#7D8791', fontSize: 8 }, likedText: { color: '#BF7068' }, feedEnd: { alignItems: 'center', paddingTop: 15, paddingBottom: 10 }, feedEndStar: { color: '#D0AE63', fontSize: 16 }, feedEndText: { marginTop: 4, color: '#717D88', fontSize: 9, fontWeight: '700' }, feedEndSub: { marginTop: 3, color: '#A1A7AC', fontSize: 8 },
  commentComposer: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 9, borderTopWidth: 1, borderTopColor: '#F0EFEC' }, commentInput: { flex: 1, height: 33, paddingHorizontal: 9, borderRadius: 7, borderWidth: 1, borderColor: '#E8E6E0', color: '#465363', fontSize: 9 }, commentSend: { height: 31, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#293A50' }, commentSendText: { color: '#FFF', fontSize: 8, fontWeight: '700' },
  bottomNav: { minHeight: 59, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E9E6E0', backgroundColor: '#FCFBF9', justifyContent: 'space-around' }, tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', gap: 2 }, tabIconWrap: { position: 'relative' }, tabIcon: { color: '#A0A6AD', fontSize: 18, lineHeight: 21 }, tabIconActive: { color: '#AE8A44' }, tabLabel: { color: '#9299A0', fontSize: 8 }, tabLabelActive: { color: '#6C592E', fontWeight: '700' }, tabActiveLine: { position: 'absolute', top: 0, height: 2, width: 23, backgroundColor: '#CDAA5D', borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }, tabBadge: { position: 'absolute', width: 6, height: 6, borderRadius: 3, right: -4, top: 1, backgroundColor: '#D77669', borderWidth: 1, borderColor: '#FCFBF9' },
  pageIntro: { marginBottom: 18 }, pageTitle: { marginTop: 7, color: COLORS.ink, fontSize: 22, fontWeight: '700', letterSpacing: -0.6 },
  discoverBanner: { padding: 17, borderRadius: 13, backgroundColor: '#E9EEE8', borderWidth: 1, borderColor: '#DFE7DE' }, discoverBannerLabel: { color: '#64846D', fontSize: 8, letterSpacing: 1.1, fontWeight: '800' }, discoverBannerTitle: { marginTop: 8, maxWidth: 240, color: '#243A2C', fontSize: 19, fontWeight: '700', letterSpacing: -0.5 }, discoverBannerText: { marginTop: 5, color: '#75867A', fontSize: 9 }, fieldLabel: { marginTop: 19, marginBottom: 8, color: '#959A99', fontSize: 8, letterSpacing: 1, fontWeight: '800' }, sportFilters: { gap: 7, paddingBottom: 2 }, filterChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 7, backgroundColor: '#EFEEE9', borderWidth: 1, borderColor: '#EFEEE9' }, filterChipActive: { backgroundColor: '#25364B', borderColor: '#25364B' }, filterChipText: { color: '#727B83', fontSize: 8 }, filterChipTextActive: { color: '#F7F5EF', fontWeight: '700' }, discoverCard: { minHeight: 71, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 10, marginBottom: 8, borderWidth: 1, borderColor: '#EBE9E4', borderRadius: 10, backgroundColor: '#FFF' }, discoverIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, discoverEmoji: { fontSize: 19 }, discoverInfo: { flex: 1 }, discoverName: { color: '#344051', fontSize: 10, fontWeight: '700' }, discoverMeta: { marginTop: 4, color: '#8C959E', fontSize: 8 }, discoverMembers: { marginTop: 4, color: '#A1A8AE', fontSize: 8 }, joinButton: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 6, backgroundColor: '#273A53' }, joinButtonText: { color: '#FFF', fontSize: 8, fontWeight: '700' }, joinedButton: { backgroundColor: '#F1F3EF' }, joinedButtonText: { color: '#758371' }, bottomHint: { alignItems: 'center', paddingVertical: 17 }, bottomHintText: { color: '#929AA0', fontSize: 9 }, bottomHintLink: { marginTop: 5, color: '#977943', fontSize: 9, fontWeight: '700' },
  alertToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17 }, alertCount: { flexDirection: 'row', alignItems: 'center', gap: 6 }, alertCountText: { color: '#7C8790' }, alertCountDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D2AF61' }, markReadText: { color: '#8D7647', fontSize: 9, fontWeight: '600' }, notificationDay: { marginBottom: 8, color: '#9EA3A4', fontSize: 8, letterSpacing: 1, fontWeight: '800' }, notificationCard: { minHeight: 76, flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 11, marginBottom: 7, borderRadius: 10, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF' }, notificationUnread: { backgroundColor: '#FFFEFA', borderColor: '#E9E2D3' }, notificationIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, notifWelcome: { backgroundColor: '#F2EBD8' }, notifLike: { backgroundColor: '#F6E6E3' }, notifCommunity: { backgroundColor: '#E4EEE7' }, notificationCopy: { flex: 1 }, notificationTitle: { color: '#374354', fontSize: 9, fontWeight: '700' }, notificationBody: { marginTop: 4, color: '#858F98', fontSize: 8, lineHeight: 13 }, notificationTime: { marginTop: 5, color: '#A5ABB0', fontSize: 7 }, unreadDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4, backgroundColor: '#D1AB5C' },
  profileCard: { padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#EAE8E2', backgroundColor: '#FFF' }, profileTop: { flexDirection: 'row', alignItems: 'center' }, profileAvatar: { width: 55, height: 55, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E1E9E0', position: 'relative' }, profileAvatarText: { color: '#4D7257', fontSize: 16, fontWeight: '800' }, profileVerified: { position: 'absolute', right: -3, bottom: -2, width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#FFF', backgroundColor: '#5B9B70', alignItems: 'center', justifyContent: 'center' }, profileVerifiedText: { color: '#FFF', fontSize: 8, fontWeight: '900' }, profileIdentity: { flex: 1, paddingLeft: 10 }, profileName: { color: '#2B3849', fontSize: 12, fontWeight: '700' }, profileEmail: { marginTop: 4, color: '#9099A2', fontSize: 8 }, profileLocation: { flexDirection: 'row', marginTop: 5 }, profileLocationIcon: { color: '#8C969E', fontSize: 8 }, profileLocationText: { color: '#8C969E', fontSize: 8 }, editProfile: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E7E6E1', borderRadius: 6 }, editProfileText: { color: '#687581', fontSize: 8, fontWeight: '600' }, profileStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0EFEB' }, profileStatNum: { color: '#354254', fontSize: 13, fontWeight: '700', textAlign: 'center' }, profileStatLabel: { marginTop: 3, color: '#A0A6AA', fontSize: 7, letterSpacing: 0.5 }, profileStatDivider: { height: 24, width: 1, backgroundColor: '#EEEDE9' }, profileSectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 19, marginBottom: 9 }, editPencil: { color: '#A18B5B', fontSize: 16 }, interestCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF' }, interestChip: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: '#E9E8E3', backgroundColor: '#FBFAF8' }, interestChipSelected: { borderColor: '#DCD0B2', backgroundColor: '#F5F0E3' }, interestChipText: { color: '#89929B', fontSize: 8 }, interestChipTextSelected: { color: '#806A39', fontWeight: '700' }, workspaceCard: { paddingHorizontal: 11, borderRadius: 10, borderWidth: 1, borderColor: '#ECEAE5', backgroundColor: '#FFF' }, workspaceRow: { minHeight: 59, flexDirection: 'row', alignItems: 'center', gap: 9 }, workspaceRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0EFEB' }, workspaceRoleIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F1ED' }, workspaceRoleIconSelected: { backgroundColor: '#F2EBD9' }, workspaceRoleGlyph: { color: '#8C7A54', fontSize: 14 }, workspaceRowCopy: { flex: 1 }, workspaceRowTitle: { color: '#4B5765', fontSize: 9, fontWeight: '700' }, workspaceRowSubtitle: { marginTop: 3, color: '#9AA1A7', fontSize: 8 }, workspaceDisabled: { color: '#969EA6' }, radio: { width: 16, height: 16, borderWidth: 1, borderColor: '#D5D8D9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, radioSelected: { borderColor: '#B7944F' }, radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#BE9B55' }, workspaceLock: { color: '#ADB2B5', fontSize: 14, paddingHorizontal: 2 }, pendingText: { color: '#AE8540', fontSize: 7, fontWeight: '800', letterSpacing: 0.3 }, applyRoleButton: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, borderTopColor: '#F0EFEB' }, applyPlus: { width: 27, height: 27, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3EFE4' }, applyRoleCopy: { flex: 1 }, applyRoleTitle: { color: '#78633A', fontSize: 9, fontWeight: '700' }, applyRoleSub: { marginTop: 3, color: '#9DA3A7', fontSize: 8 }, applyChevron: { color: '#A28C5D', fontSize: 14 }, settingsCard: { minHeight: 56, marginTop: 12, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: '#ECEAE5', borderRadius: 10, backgroundColor: '#FFF' }, settingsIcon: { width: 29, height: 29, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F1EF' }, settingsCopy: { flex: 1 }, settingsTitle: { color: '#53606D', fontSize: 9, fontWeight: '700' }, settingsSubtitle: { marginTop: 3, color: '#A1A7AA', fontSize: 8 }, settingsArrow: { color: '#A4AAB0', fontSize: 15 }, signOutButton: { alignItems: 'center', padding: 13 }, signOutText: { color: '#BA7069', fontSize: 9, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,25,38,.35)' }, sheet: { paddingHorizontal: 18, paddingTop: 9, paddingBottom: 22, borderTopLeftRadius: 19, borderTopRightRadius: 19, backgroundColor: '#FBFAF7', maxHeight: '92%' }, nameEditCard: { padding: 18, borderRadius: 16, backgroundColor: '#FBFAF7' }, nameSaveButton: { marginTop: 13 }, sheetHandle: { alignSelf: 'center', width: 34, height: 4, borderRadius: 3, marginBottom: 14, backgroundColor: '#D6D4CE' }, sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sheetEyebrow: { color: '#A28B57', fontSize: 7, letterSpacing: 1, fontWeight: '800' }, sheetTitle: { marginTop: 4, color: '#273447', fontSize: 17, fontWeight: '700' }, closeButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F0EEE9' }, sheetAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 11 }, sheetAuthorName: { color: '#465363', fontSize: 9, fontWeight: '700' }, sheetAuthorSub: { marginTop: 3, color: '#9CA3A8', fontSize: 8 }, composerInput: { minHeight: 116, padding: 11, borderWidth: 1, borderColor: '#E9E6DE', borderRadius: 8, backgroundColor: '#FFF', color: '#465363', fontSize: 10, lineHeight: 16 }, composerTools: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 }, composerTool: { color: '#8E7B50', fontSize: 8 }, characterCount: { color: '#A3A8AA', fontSize: 8 }, primaryButton: { height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: '#293A50' }, primaryButtonText: { color: '#FFF', fontSize: 9, fontWeight: '700' }, disabledButton: { backgroundColor: '#9DA7B0' }, modalDescription: { marginTop: 7, marginBottom: 5, color: '#89939A', fontSize: 9, lineHeight: 14 }, roleChoiceRow: { flexDirection: 'row', gap: 7 }, roleChoice: { flex: 1, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#E5E4DE', borderRadius: 7, backgroundColor: '#FFF' }, roleChoiceActive: { borderColor: '#D4BD84', backgroundColor: '#F6F0E1' }, roleChoiceText: { color: '#7D8790', fontSize: 8 }, roleChoiceTextActive: { color: '#786235', fontWeight: '700' }, experienceInput: { height: 78, paddingTop: 10 }, reviewNotice: { flexDirection: 'row', gap: 7, alignItems: 'center', padding: 9, marginTop: 10, marginBottom: 11, borderRadius: 7, backgroundColor: '#F1F1EA' }, reviewNoticeIcon: { color: '#86937D', fontSize: 12 }, reviewNoticeText: { flex: 1, color: '#858F84', fontSize: 8, lineHeight: 12 }, confirmBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 23, backgroundColor: 'rgba(15,25,38,.4)' }, confirmCard: { width: '100%', padding: 18, borderRadius: 13, backgroundColor: '#FFF' }, confirmIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#F8EDE9' }, confirmTitle: { marginTop: 11, color: '#2A3748', fontSize: 15, fontWeight: '700' }, confirmDescription: { marginTop: 6, color: '#858F98', fontSize: 9, lineHeight: 14 }, confirmActions: { flexDirection: 'row', gap: 8, marginTop: 17 }, confirmCancel: { flex: 1, height: 37, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6E8E8', borderRadius: 7 }, confirmCancelText: { color: '#6F7A85', fontSize: 9, fontWeight: '600' }, confirmSend: { flex: 1, height: 37, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: '#A65550' }, confirmSendText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  inputLabel: { marginTop: 12, marginBottom: 6, color: '#777F84', fontSize: 8, letterSpacing: 0.8, fontWeight: '800' }, textInput: { minHeight: 41, borderWidth: 1, borderColor: '#E6E3DC', borderRadius: 7, backgroundColor: '#FFF', paddingHorizontal: 11, color: '#354254', fontSize: 10 },
});
