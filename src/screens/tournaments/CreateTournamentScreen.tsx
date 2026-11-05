import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { tournamentService } from '../../services/tournamentService';
import { SportType, Tournament, TournamentFormat } from '../../types/tournament.types';
import { Venue } from '../../types/venue.types';

interface Props {
  onBack: () => void;
  onCreateSuccess: (tournament: Tournament) => void;
}

const SPORTS_LIST: { id: SportType; label: string; icon: string }[] = [
  { id: 'CRICKET', label: 'Cricket', icon: '🏏' },
  { id: 'FOOTBALL', label: 'Football', icon: '⚽' },
  { id: 'BADMINTON', label: 'Badminton', icon: '🏸' },
  { id: 'BASKETBALL', label: 'Basketball', icon: '🏀' },
  { id: 'VOLLEYBALL', label: 'Volleyball', icon: '🏐' },
];

const FORMAT_OPTIONS: { id: TournamentFormat; title: string; subtitle: string; icon: string }[] = [
  {
    id: 'KNOCKOUT_SINGLE',
    title: 'Single Elimination (Knockout)',
    subtitle: 'Loser is eliminated immediately each round',
    icon: '⚡',
  },
  {
    id: 'ROUND_ROBIN',
    title: 'Round Robin (League)',
    subtitle: 'Every team plays against all other teams',
    icon: '🔄',
  },
  {
    id: 'GROUP_AND_KNOCKOUT',
    title: 'Group Stage + Knockout',
    subtitle: 'Group round-robin followed by knockout playoffs',
    icon: '🏆',
  },
];

const TEAM_CAPACITY_PRESETS = [4, 8, 16, 32];

const SRI_LANKA_DEFAULT_VENUES: Partial<Venue>[] = [
  {
    id: 'venue-colombo-futsal',
    venueName: 'Colombo Futsal Arena',
    city: 'Colombo',
    addressLine: 'Dehiwala Road, Colombo 06',
    hourlyBaseRate: 4500,
  },
  {
    id: 'venue-crfc',
    venueName: 'CR & FC Grounds',
    city: 'Colombo',
    addressLine: 'Malalasekara Mawatha, Colombo 07',
    hourlyBaseRate: 8500,
  },
  {
    id: 'venue-sugathadasa',
    venueName: 'Sugathadasa Indoor Stadium',
    city: 'Colombo',
    addressLine: 'Sirimavo Bandaranaike Mawatha, Colombo 14',
    hourlyBaseRate: 12000,
  },
  {
    id: 'venue-kandy-asgiriya',
    venueName: 'Asgiriya Sports Complex',
    city: 'Kandy',
    addressLine: 'Asgiriya, Kandy',
    hourlyBaseRate: 6000,
  },
  {
    id: 'venue-galle-international',
    venueName: 'Galle International Sports Arena',
    city: 'Galle',
    addressLine: 'Marine Drive, Galle',
    hourlyBaseRate: 7500,
  },
];

export default function CreateTournamentScreen({ onBack, onCreateSuccess }: Props) {
  const { accessToken, userCity } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [venues, setVenues] = useState<Partial<Venue>[]>(SRI_LANKA_DEFAULT_VENUES);

  // Form State
  const [tournamentName, setTournamentName] = useState('');
  const [sportType, setSportType] = useState<SportType>('FOOTBALL');
  const [tournamentFormat, setTournamentFormat] = useState<TournamentFormat>('KNOCKOUT_SINGLE');
  const [minTeams, setMinTeams] = useState('4');
  const [maxTeams, setMaxTeams] = useState('16');
  const [registrationFee, setRegistrationFee] = useState('5000');
  const [prizePool, setPrizePool] = useState('LKR 100,000 + Trophy');

  // Dates
  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextMonthEnd = new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000);
  const deadlineDate = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(nextMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(nextMonthEnd.toISOString().split('T')[0]);
  const [registrationDeadline, setRegistrationDeadline] = useState(deadlineDate.toISOString().split('T')[0]);

  // Venue & City
  const [city, setCity] = useState(userCity || 'Colombo');
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  // Description & Rules
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');

  // Load venues from backend
  useEffect(() => {
    async function fetchVenues() {
      try {
        setLoadingVenues(true);
        const liveVenues = await tournamentService.getVenues(sportType, city);
        if (liveVenues && liveVenues.length > 0) {
          setVenues(liveVenues);
        }
      } catch {
        // Fall back to default Sri Lankan venues list
      } finally {
        setLoadingVenues(false);
      }
    }
    fetchVenues();
  }, [sportType, city]);

  const handleSubmit = async () => {
    const trimmedName = tournamentName.trim();
    if (trimmedName.length < 3) {
      Alert.alert('Required Field', 'Please enter a tournament name (at least 3 characters).');
      return;
    }

    const minNum = parseInt(minTeams, 10);
    const maxNum = parseInt(maxTeams, 10);

    if (isNaN(minNum) || isNaN(maxNum) || minNum < 2) {
      Alert.alert('Invalid Teams', 'Minimum participating teams must be at least 2.');
      return;
    }

    if (maxNum < minNum) {
      Alert.alert('Invalid Teams', 'Maximum teams cannot be less than minimum teams.');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Missing Dates', 'Please specify tournament start and end dates.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      Alert.alert('Invalid Date Range', 'End date cannot precede the start date.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        tournamentName: trimmedName,
        sportType,
        tournamentFormat,
        minParticipatingTeams: minNum,
        maxParticipatingTeams: maxNum,
        registrationFee: parseFloat(registrationFee) || 0,
        prizePool: prizePool.trim() || undefined,
        startDate,
        endDate,
        registrationDeadline: registrationDeadline || undefined,
        venueId: selectedVenueId || undefined,
        city: city.trim() || undefined,
        description: description.trim() || undefined,
        rules: rules.trim() || undefined,
      };

      if (!accessToken) {
        Alert.alert('Authentication Required', 'Please log in to publish a tournament.');
        return;
      }

      const created = await tournamentService.createTournament(accessToken, payload);
      Alert.alert(
        'Tournament Published! 🏆',
        `"${trimmedName}" is now open for registrations and live in the tournament directory.`,
        [
          {
            text: 'View in Workspace',
            onPress: () => onCreateSuccess(created),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Creation Failed', err?.message || 'Could not publish tournament.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Top Header ────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <Pressable style={s.backBtn} onPress={onBack}>
          <Text style={s.backBtnText}>← Back</Text>
        </Pressable>
        <View style={s.headerTitleWrap}>
          <Text style={s.screenTitle}>Create Tournament</Text>
          <Text style={s.screenSubtitle}>Step 3 • Sanction Official Event</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={s.bannerCard}>
          <View style={s.bannerBadge}>
            <Text style={s.bannerBadgeText}>OFFICIAL SANCTIONING</Text>
          </View>
          <Text style={s.bannerTitle}>Launch Your Championship</Text>
          <Text style={s.bannerDesc}>
            Configure competition rules, bracket format, venue, and team entry criteria.
            Registered teams will appear in your organizer workspace immediately.
          </Text>
        </View>

        {/* ── SECTION 1: Basic Information ────────────────────────── */}
        <View style={s.sectionCard}>
          <Text style={s.sectionHeader}>1. BASIC INFORMATION</Text>

          <Text style={s.label}>TOURNAMENT NAME *</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Colombo Premier Futsal Championship 2026"
            placeholderTextColor="#9CA3AF"
            value={tournamentName}
            onChangeText={setTournamentName}
          />

          <Text style={s.label}>SPORT DISCIPLINE *</Text>
          <View style={s.sportChipGrid}>
            {SPORTS_LIST.map((sp) => {
              const active = sportType === sp.id;
              return (
                <Pressable
                  key={sp.id}
                  style={[s.sportChip, active && s.sportChipActive]}
                  onPress={() => setSportType(sp.id)}
                >
                  <Text style={s.sportIcon}>{sp.icon}</Text>
                  <Text style={[s.sportLabel, active && s.sportLabelActive]}>{sp.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={s.label}>TOURNAMENT FORMAT *</Text>
          <View style={s.formatList}>
            {FORMAT_OPTIONS.map((f) => {
              const active = tournamentFormat === f.id;
              return (
                <Pressable
                  key={f.id}
                  style={[s.formatCard, active && s.formatCardActive]}
                  onPress={() => setTournamentFormat(f.id)}
                >
                  <View style={s.formatHeader}>
                    <Text style={s.formatIcon}>{f.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.formatTitle, active && s.formatTitleActive]}>
                        {f.title}
                      </Text>
                      <Text style={s.formatDesc}>{f.subtitle}</Text>
                    </View>
                    <View style={[s.radioCircle, active && s.radioCircleActive]}>
                      {active && <View style={s.radioDot} />}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── SECTION 2: Capacity & Economics ─────────────────────── */}
        <View style={s.sectionCard}>
          <Text style={s.sectionHeader}>2. CAPACITY & ENTRY ECONOMICS</Text>

          <Text style={s.label}>MAX PARTICIPATING TEAMS *</Text>
          <View style={s.presetRow}>
            {TEAM_CAPACITY_PRESETS.map((count) => {
              const active = maxTeams === count.toString();
              return (
                <Pressable
                  key={count}
                  style={[s.presetPill, active && s.presetPillActive]}
                  onPress={() => setMaxTeams(count.toString())}
                >
                  <Text style={[s.presetText, active && s.presetTextActive]}>
                    {count} Teams
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={s.twoColRow}>
            <View style={s.col}>
              <Text style={s.label}>MIN TEAMS</Text>
              <TextInput
                style={s.input}
                keyboardType="numeric"
                value={minTeams}
                onChangeText={setMinTeams}
              />
            </View>
            <View style={s.col}>
              <Text style={s.label}>MAX TEAMS</Text>
              <TextInput
                style={s.input}
                keyboardType="numeric"
                value={maxTeams}
                onChangeText={setMaxTeams}
              />
            </View>
          </View>

          <View style={s.twoColRow}>
            <View style={s.col}>
              <Text style={s.label}>ENTRY FEE (LKR)</Text>
              <TextInput
                style={s.input}
                placeholder="0"
                keyboardType="numeric"
                value={registrationFee}
                onChangeText={setRegistrationFee}
              />
            </View>
            <View style={s.col}>
              <Text style={s.label}>PRIZE POOL</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. LKR 100,000"
                placeholderTextColor="#9CA3AF"
                value={prizePool}
                onChangeText={setPrizePool}
              />
            </View>
          </View>
        </View>

        {/* ── SECTION 3: Schedule & Deadlines ─────────────────────── */}
        <View style={s.sectionCard}>
          <Text style={s.sectionHeader}>3. SCHEDULE & DEADLINES</Text>

          <View style={s.twoColRow}>
            <View style={s.col}>
              <Text style={s.label}>START DATE (YYYY-MM-DD) *</Text>
              <TextInput
                style={s.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={s.col}>
              <Text style={s.label}>END DATE (YYYY-MM-DD) *</Text>
              <TextInput
                style={s.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>

          <Text style={s.label}>REGISTRATION DEADLINE (YYYY-MM-DD)</Text>
          <TextInput
            style={s.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={registrationDeadline}
            onChangeText={setRegistrationDeadline}
          />
        </View>

        {/* ── SECTION 4: Venue & Location ─────────────────────────── */}
        <View style={s.sectionCard}>
          <Text style={s.sectionHeader}>4. VENUE & LOCATION SELECTION</Text>

          <Text style={s.label}>HOST CITY / DISTRICT</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Colombo"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
          />

          <View style={s.venueHeaderRow}>
            <Text style={s.label}>SELECT SPORT VENUE</Text>
            {loadingVenues && <ActivityIndicator size="small" color="#10B981" />}
          </View>

          <View style={s.venueList}>
            {venues.map((v) => {
              const active = selectedVenueId === v.id;
              return (
                <Pressable
                  key={v.id}
                  style={[s.venueCard, active && s.venueCardActive]}
                  onPress={() => setSelectedVenueId(active ? null : (v.id || null))}
                >
                  <View style={s.venueHeader}>
                    <Text style={s.venuePinIcon}>📍</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.venueName, active && s.venueNameActive]}>
                        {v.venueName}
                      </Text>
                      <Text style={s.venueAddress}>
                        {v.addressLine || v.city} • LKR {v.hourlyBaseRate?.toLocaleString() || 'N/A'}/hr
                      </Text>
                    </View>
                    <View style={[s.radioCircle, active && s.radioCircleActive]}>
                      {active && <View style={s.radioDot} />}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── SECTION 5: Description & Rules ──────────────────────── */}
        <View style={s.sectionCard}>
          <Text style={s.sectionHeader}>5. EVENT DETAILS & RULES</Text>

          <Text style={s.label}>TOURNAMENT OVERVIEW</Text>
          <TextInput
            style={[s.input, s.textArea]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Introduce the competition, participating club requirements, spectators, etc..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={s.label}>OFFICIAL RULES & REGULATIONS</Text>
          <TextInput
            style={[s.input, s.textArea]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Specify player eligibility, substitution rules, match duration, tie-breaker penalties..."
            placeholderTextColor="#9CA3AF"
            value={rules}
            onChangeText={setRules}
          />
        </View>

        {/* ── Submit CTA ──────────────────────────────────────────── */}
        <Pressable
          style={[s.submitBtn, submitting && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.submitBtnText}>Publish Tournament 🚀</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  bannerBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  bannerDesc: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 85,
  },
  sportChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sportChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  sportIcon: {
    fontSize: 16,
  },
  sportLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  sportLabelActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  formatList: {
    gap: 10,
    marginBottom: 6,
  },
  formatCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formatCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  formatIcon: {
    fontSize: 20,
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  formatTitleActive: {
    color: '#065F46',
  },
  formatDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#10B981',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  presetTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  venueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  venueList: {
    gap: 8,
    marginTop: 4,
  },
  venueCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  venueCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  venuePinIcon: {
    fontSize: 18,
  },
  venueName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  venueNameActive: {
    color: '#065F46',
  },
  venueAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

