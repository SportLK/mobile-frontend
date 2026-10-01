import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface HomeScreenProps {
  onNavigateToTeams: () => void;
  onNavigateToCreateTeam: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToTeams,
  onNavigateToCreateTeam,
}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner */}
      <View style={styles.headerHero}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>Kumara Perera 👋</Text>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search events, teams, players...</Text>
        </View>
      </View>

      {/* Live Matches Carousel Card */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>• Live Matches (3)</Text>
        <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <View style={styles.matchCard}>
          <View style={styles.matchCardTop}>
            <Text style={styles.matchCategory}>Colombo Lions vs Kandy Kings</Text>
            <View style={styles.liveTag}><Text style={styles.liveTagText}>• LIVE</Text></View>
          </View>
          <Text style={styles.scoreText}>187 / 6 vs 142 / 9</Text>
          <Text style={styles.oversText}>Innings 2 - 18.3 ov</Text>
        </View>

        <View style={styles.matchCard}>
          <View style={styles.matchCardTop}>
            <Text style={styles.matchCategory}>Western Stars vs Galle United</Text>
            <View style={styles.liveTag}><Text style={styles.liveTagText}>• LIVE</Text></View>
          </View>
          <Text style={styles.scoreText}>2 - 1</Text>
          <Text style={styles.oversText}>78' - 2nd Half</Text>
        </View>
      </ScrollView>

      {/* Quick Action Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCard} onPress={onNavigateToTeams}>
          <Text style={styles.quickIcon}>👥</Text>
          <Text style={styles.quickTitle}>Find a Team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCardHighlight} onPress={onNavigateToCreateTeam}>
          <Text style={styles.quickIcon}>➕</Text>
          <Text style={styles.quickTitleHighlight}>Create Team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard}>
          <Text style={styles.quickIcon}>🏆</Text>
          <Text style={styles.quickTitle}>Tournaments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard}>
          <Text style={styles.quickIcon}>📍</Text>
          <Text style={styles.quickTitle}>Find Venues</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Banner */}
      <View style={styles.featuredBanner}>
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>⚡ FEATURED TOURNAMENT</Text>
        </View>
        <Text style={styles.bannerTitle}>National Sports Championship 2026</Text>
        <Text style={styles.bannerSub}>Oct 1–30 • Multiple Venues across Sri Lanka</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerHero: {
    backgroundColor: '#1E40AF',
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  userInfo: {
    marginBottom: 16,
  },
  greeting: {
    color: '#93C5FD',
    fontSize: 13,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#94A3B8',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    width: 260,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  matchCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  liveTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E40AF',
  },
  oversText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickCardHighlight: {
    width: '48%',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  quickTitleHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  featuredBanner: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
  },
  featuredBadge: {
    backgroundColor: '#38BDF8',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
