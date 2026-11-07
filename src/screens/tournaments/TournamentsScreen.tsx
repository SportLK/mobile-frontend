import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { tournamentService } from '../../services/tournamentService';
import { Tournament, TournamentStatus, SportType } from '../../types/tournament.types';

interface TournamentsScreenProps {
  onSelectTournament: (tournament: Tournament) => void;
  onOpenBrackets: (tournament: Tournament) => void;
  onOpenSchedules: (tournament: Tournament) => void;
  onCreateTournament: () => void;
  onOpenOrganizerWorkspace: () => void;
  onApplyOrganizer: () => void;
}

const FALLBACK_TOURNAMENTS: Tournament[] = [
  {
    id: 't-demo-1',
    tournamentName: 'Colombo Premier T20 League 2026',
    description: 'The pinnacle of grassroots cricket in Western Province featuring 16 registered club squads.',
    sportType: 'CRICKET',
    tournamentFormat: 'KNOCKOUT_SINGLE',
    tournamentStatus: 'OPEN_FOR_REGISTRATION',
    startDate: '2026-11-15',
    endDate: '2026-11-28',
    city: 'Colombo',
    venue: {
      id: 'v-1',
      name: 'Colombo Oval',
      city: 'Colombo',
      sportType: 'CRICKET',
      address: 'Colombo 07',
      hourlyRate: 5000,
      facilities: ['Floodlights', 'Dressing Rooms', 'Turf Wicket'],
      isActive: true,
      createdAt: '2026-01-01',
    },
    minParticipatingTeams: 8,
    maxParticipatingTeams: 16,
    confirmedTeamsCount: 12,
    registrationFee: 15000,
    prizePool: '150,000',
    organizerId: 'org-demo-1',
    organizer: {
      id: 'org-demo-1',
      displayName: 'Colombo Cricket Association',
      email: 'cca@sportlk.com',
    },
    rules: 'Official ICC standard 20-over rules apply. White ball & team colored kits mandatory.',
    createdAt: '2026-10-01',
  },
  {
    id: 't-demo-2',
    tournamentName: 'Kandy Inter-Club Futsal Championship',
    description: 'High-octane 5-a-side futsal tournament held under floodlights.',
    sportType: 'FOOTBALL',
    tournamentFormat: 'KNOCKOUT_SINGLE',
    tournamentStatus: 'ONGOING',
    startDate: '2026-11-01',
    endDate: '2026-11-18',
    city: 'Kandy',
    venue: {
      id: 'v-2',
      name: 'Kandy Sports Complex',
      city: 'Kandy',
      sportType: 'FUTSAL',
      address: 'Kandy City Center',
      hourlyRate: 4000,
      facilities: ['Indoor Court', 'Scoreboard', 'Showers'],
      isActive: true,
      createdAt: '2026-01-01',
    },
    minParticipatingTeams: 4,
    maxParticipatingTeams: 8,
    confirmedTeamsCount: 8,
    registrationFee: 10000,
    prizePool: '80,000',
    organizerId: 'org-demo-2',
    organizer: {
      id: 'org-demo-2',
      displayName: 'Central Futsal Federation',
      email: 'futsal@kandy.lk',
    },
    createdAt: '2026-10-05',
  },
  {
    id: 't-demo-3',
    tournamentName: 'Galle Open Badminton Masters',
    description: 'Men and Women Open Singles and Doubles knockout tournament.',
    sportType: 'BADMINTON',
    tournamentFormat: 'KNOCKOUT_SINGLE',
    tournamentStatus: 'OPEN_FOR_REGISTRATION',
    startDate: '2026-12-05',
    endDate: '2026-12-07',
    city: 'Galle',
    venue: {
      id: 'v-3',
      name: 'Galle Indoor Stadium',
      city: 'Galle',
      sportType: 'BADMINTON',
      address: 'Galle Fort Road',
      hourlyRate: 3500,
      facilities: ['Wooden Courts', 'Air Conditioning'],
      isActive: true,
      createdAt: '2026-01-01',
    },
    minParticipatingTeams: 8,
    maxParticipatingTeams: 32,
    confirmedTeamsCount: 18,
    registrationFee: 5000,
    prizePool: '60,000',
    organizerId: 'org-demo-3',
    organizer: {
      id: 'org-demo-3',
      displayName: 'Southern Badminton Guild',
      email: 'badminton@galle.lk',
    },
    createdAt: '2026-10-12',
  },
  {
    id: 't-demo-4',
    tournamentName: 'Western Province Basketball Blitz',
    description: 'Annual 3x3 and 5x5 championship for university and club squads.',
    sportType: 'BASKETBALL',
    tournamentFormat: 'ROUND_ROBIN',
    tournamentStatus: 'COMPLETED',
    startDate: '2026-10-10',
    endDate: '2026-10-18',
    city: 'Colombo',
    venue: {
      id: 'v-4',
      name: 'Sugathadasa Indoor Stadium',
      city: 'Colombo',
      sportType: 'BASKETBALL',
      address: 'Sugathadasa, Colombo 14',
      hourlyRate: 6000,
      facilities: ['Electronic Scoreboard', 'Bleachers', 'VIP Lounge'],
      isActive: true,
      createdAt: '2026-01-01',
    },
    minParticipatingTeams: 6,
    maxParticipatingTeams: 12,
    confirmedTeamsCount: 12,
    registrationFee: 8000,
    prizePool: '75,000',
    organizerId: 'org-demo-4',
    organizer: {
      id: 'org-demo-4',
      displayName: 'WP Basketball League',
      email: 'basketball@wp.lk',
    },
    createdAt: '2026-09-20',
  },
];

type StatusFilter = 'ALL' | 'OPEN' | 'ONGOING' | 'COMPLETED';

export default function TournamentsScreen({
  onSelectTournament,
  onOpenBrackets,
  onOpenSchedules,
  onCreateTournament,
  onOpenOrganizerWorkspace,
  onApplyOrganizer,
}: TournamentsScreenProps) {
  const { roles } = useAuth();
  const isOrganizer = roles.includes('organizer');

  const [tournaments, setTournaments] = useState<Tournament[]>(FALLBACK_TOURNAMENTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedSport, setSelectedSport] = useState('All');

  const fetchTournaments = useCallback(async () => {
    try {
      const data = await tournamentService.getTournaments({
        sportType: selectedSport === 'All' ? undefined : selectedSport.toUpperCase(),
        status: statusFilter === 'ALL' ? undefined : statusFilter === 'OPEN' ? 'OPEN_FOR_REGISTRATION' : statusFilter,
        search: search.trim() || undefined,
      });
      if (Array.isArray(data) && data.length > 0) {
        setTournaments(data);
      }
    } catch {
      // Fallback
    }
  }, [selectedSport, statusFilter, search]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournaments();
    setRefreshing(false);
  };

  const filteredTournaments = tournaments.filter((t) => {
    const rawStatus = t.tournamentStatus || (t as any).status || '';
    if (statusFilter === 'OPEN' && rawStatus !== 'OPEN_FOR_REGISTRATION' && rawStatus !== 'OPEN') return false;
    if (statusFilter === 'ONGOING' && rawStatus !== 'ONGOING') return false;
    if (statusFilter === 'COMPLETED' && rawStatus !== 'COMPLETED') return false;

    if (selectedSport !== 'All' && t.sportType.toUpperCase() !== selectedSport.toUpperCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const title = (t.tournamentName || (t as any).name || '').toLowerCase();
      const city = (t.city || '').toLowerCase();
      const venue = (t.venue?.name || (t as any).venueName || '').toLowerCase();
      return title.includes(q) || city.includes(q) || venue.includes(q);
    }
    return true;
  });

  const getStatusColor = (rawStatus: string) => {
    if (rawStatus === 'OPEN_FOR_REGISTRATION' || rawStatus === 'OPEN') {
      return { bg: '#D1FAE5', text: '#065F46', label: 'REGISTRATIONS OPEN' };
    }
    if (rawStatus === 'ONGOING') {
      return { bg: '#DBEAFE', text: '#1E40AF', label: 'IN PROGRESS' };
    }
    if (rawStatus === 'COMPLETED') {
      return { bg: '#F3F4F6', text: '#4B5563', label: 'COMPLETED' };
    }
    return { bg: '#FEF3C7', text: '#92400E', label: rawStatus };
  };

  return (
    <View style={s.container}>
      {/* Top Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerKicker}>MEMBER 3 MODULE</Text>
          <Text style={s.headerTitle}>Tournaments</Text>
        </View>
        {isOrganizer ? (
          <TouchableOpacity style={s.organizerBtn} onPress={onOpenOrganizerWorkspace}>
            <Text style={s.organizerBtnText}>Organizer Workspace ⚙️</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.applyBtn} onPress={onApplyOrganizer}>
            <Text style={s.applyBtnText}>Host a Tournament 🎫</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          placeholder="Search tournaments, venues, cities..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Status Filter Chips */}
      <View style={s.filterRow}>
        {(['ALL', 'OPEN', 'ONGOING', 'COMPLETED'] as StatusFilter[]).map((st) => (
          <TouchableOpacity
            key={st}
            style={[s.filterChip, statusFilter === st && s.filterChipActive]}
            onPress={() => setStatusFilter(st)}
          >
            <Text style={[s.filterChipText, statusFilter === st && s.filterChipTextActive]}>
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sport Filter Strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sportStrip}>
        {['All', 'Cricket', 'Football', 'Badminton', 'Basketball'].map((sp) => (
          <TouchableOpacity
            key={sp}
            style={[s.sportChip, selectedSport === sp && s.sportChipActive]}
            onPress={() => setSelectedSport(sp)}
          >
            <Text style={[s.sportChipText, selectedSport === sp && s.sportChipTextActive]}>
              {sp}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tournaments List */}
      <ScrollView
        style={s.listScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredTournaments.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyTitle}>No tournaments found</Text>
            <Text style={s.emptySub}>Try adjusting your search query or sport filter.</Text>
          </View>
        ) : (
          filteredTournaments.map((t) => {
            const rawStatus = t.tournamentStatus || (t as any).status || '';
            const stInfo = getStatusColor(rawStatus);
            const title = t.tournamentName || (t as any).name || 'Tournament';
            const venue = t.venue?.name || (t as any).venueName || 'Colombo Grounds';
            const confirmedTeams = t.confirmedTeamsCount ?? (t as any).registeredTeamsCount ?? 0;
            const maxTeams = t.maxParticipatingTeams ?? (t as any).maxTeams ?? 16;

            return (
              <View key={t.id} style={s.card}>
                <View style={s.cardTopRow}>
                  <View style={s.sportTag}>
                    <Text style={s.sportTagText}>{t.sportType}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: stInfo.bg }]}>
                    <Text style={[s.statusBadgeText, { color: stInfo.text }]}>{stInfo.label}</Text>
                  </View>
                </View>

                <Text style={s.cardTitle}>{title}</Text>
                {Boolean(t.description) && (
                  <Text style={s.cardDesc} numberOfLines={2}>
                    {t.description}
                  </Text>
                )}

                <View style={s.metaGrid}>
                  <Text style={s.metaItem}>🏟️ {venue} · {t.city || 'Colombo'}</Text>
                  <Text style={s.metaItem}>📅 {t.startDate} - {t.endDate}</Text>
                  <Text style={s.metaItem}>
                    👥 {confirmedTeams} / {maxTeams} Teams Registered
                  </Text>
                  {Boolean(t.prizePool) && (
                    <Text style={[s.metaItem, s.metaPrize]}>
                      🏆 Prize: LKR {t.prizePool}
                    </Text>
                  )}
                </View>

                {/* Card Action Buttons */}
                <View style={s.cardActions}>
                  <TouchableOpacity
                    style={s.primaryAction}
                    onPress={() => onSelectTournament(t)}
                  >
                    <Text style={s.primaryActionText}>View Details & Teams</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.secondaryAction}
                    onPress={() => onOpenBrackets(t)}
                  >
                    <Text style={s.secondaryActionText}>Brackets 🌿</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.secondaryAction}
                    onPress={() => onOpenSchedules(t)}
                  >
                    <Text style={s.secondaryActionText}>Schedules 📅</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#059669',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  organizerBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  organizerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  applyBtn: {
    borderWidth: 1,
    borderColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  applyBtnText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#111827',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sportStrip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sportChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  sportChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  sportChipTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sportTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    marginBottom: 10,
  },
  metaGrid: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    gap: 4,
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  metaPrize: {
    color: '#D97706',
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryAction: {
    flex: 1.4,
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
});
