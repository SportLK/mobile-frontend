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
import { RoleApplicationRecord } from '../../types/tournament.types';
import { COLORS } from '../../constants/colors';

const SPORTS_OPTIONS = [
  { id: 'CRICKET', label: 'Cricket', icon: '🏏' },
  { id: 'FOOTBALL', label: 'Football', icon: '⚽' },
  { id: 'BADMINTON', label: 'Badminton', icon: '🏸' },
  { id: 'BASKETBALL', label: 'Basketball', icon: '🏀' },
  { id: 'VOLLEYBALL', label: 'Volleyball', icon: '🏐' },
];

const EXPERIENCE_LEVELS = [
  { id: '1-2 years', label: '1 - 2 Years' },
  { id: '3-5 years', label: '3 - 5 Years' },
  { id: '5+ years', label: '5+ Years (Veteran)' },
];

interface Props {
  onBack?: () => void;
  onNavigateToWorkspace?: () => void;
}

export default function OrganizerApplicationScreen({
  onBack,
  onNavigateToWorkspace,
}: Props) {
  const { accessToken, roles, workspace, setWorkspace } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<RoleApplicationRecord | null>(null);

  // Form State
  const [organization, setOrganization] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>(['FOOTBALL']);
  const [city, setCity] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('3-5 years');
  const [pastEvents, setPastEvents] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const isAlreadyOrganizer = roles.includes('organizer');

  // Load existing application status from backend
  const loadApplicationStatus = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const apps = await tournamentService.getMyApplications(accessToken);
      const organizerApp = apps.find(
        (a) => a.requestedRole === 'TOURNAMENT_ORGANIZER' || (a as any).requestedRole === 'organizer',
      );
      setExistingApplication(organizerApp || null);
    } catch {
      // Offline fallback: keep state as null
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicationStatus();
  }, [accessToken]);

  const toggleSport = (sportId: string) => {
    if (selectedSports.includes(sportId)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter((s) => s !== sportId));
      }
    } else {
      setSelectedSports([...selectedSports, sportId]);
    }
  };

  const handleSubmit = async () => {
    if (!organization.trim()) {
      Alert.alert('Required Field', 'Please enter your organization or club name.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Required Field', 'Please enter your primary operating city/region.');
      return;
    }
    if (pastEvents.trim().length < 20) {
      Alert.alert(
        'More Details Needed',
        'Please describe your past tournament hosting experience (minimum 20 characters).',
      );
      return;
    }
    if (!agreedTerms) {
      Alert.alert('Terms Agreement', 'Please agree to the SportLK Tournament Sanctioning Terms.');
      return;
    }

    const compiledExperience = `[City: ${city}] [Sports: ${selectedSports.join(', ')}] [Tenure: ${experienceLevel}] [Contact: ${contactNumber}] - ${pastEvents.trim()}`;

    try {
      setSubmitting(true);
      if (accessToken) {
        await tournamentService.applyForOrganizer(accessToken, {
          organization: organization.trim(),
          experience: compiledExperience,
        });
      }
      Alert.alert(
        'Application Submitted! 🎉',
        'Your organizer application has been sent for administrative review. You will receive a notification once verified.',
      );
      await loadApplicationStatus();
    } catch (error: any) {
      Alert.alert('Submission Error', error?.message || 'Could not submit your application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchToWorkspace = () => {
    setWorkspace('organizer');
    if (onNavigateToWorkspace) {
      onNavigateToWorkspace();
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Navigation Bar */}
      <View style={s.topBar}>
        {onBack ? (
          <Pressable style={s.backBtn} onPress={onBack}>
            <Text style={s.backBtnText}>← Back</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
        <Text style={s.screenTitle}>Organizer Accreditation</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={s.mutedText}>Checking accreditation status...</Text>
          </View>
        ) : isAlreadyOrganizer ? (
          /* ============================================================= */
          /* STATE A: Already Verified Organizer                          */
          /* ============================================================= */
          <View style={s.card}>
            <View style={s.verifiedIconCircle}>
              <Text style={s.verifiedIcon}>🎖️</Text>
            </View>
            <Text style={s.cardTitle}>Verified Tournament Organizer</Text>
            <Text style={s.cardSubtitle}>
              You hold full organizer accreditation on SportLK. You can create tournaments,
              coordinate venues, generate brackets, and schedule official matches.
            </Text>

            <View style={s.featureBox}>
              <Text style={s.featureItem}>✓ Create & Sanction Tournaments</Text>
              <Text style={s.featureItem}>✓ Auto-Generate Knockout & Round-Robin Brackets</Text>
              <Text style={s.featureItem}>✓ Approve & Manage Team Registrations</Text>
              <Text style={s.featureItem}>✓ Reserve Venues & Track Live Scores</Text>
            </View>

            <Pressable style={s.primaryBtn} onPress={handleSwitchToWorkspace}>
              <Text style={s.primaryBtnText}>Open Organizer Workspace  →</Text>
            </Pressable>
          </View>
        ) : existingApplication && existingApplication.status === 'PENDING' ? (
          /* ============================================================= */
          /* STATE B: Application Pending Admin Review                    */
          /* ============================================================= */
          <View style={s.card}>
            <View style={[s.statusPill, s.statusPillPending]}>
              <Text style={s.statusPillTextPending}>⏳ APPLICATION UNDER REVIEW</Text>
            </View>
            <Text style={s.cardTitle}>Review in Progress</Text>
            <Text style={s.cardSubtitle}>
              Your organizer application for{' '}
              <Text style={s.bold}>"{existingApplication.organization || 'Your Club'}"</Text> was
              received and is being reviewed by the SportLK administrative committee.
            </Text>

            <View style={s.infoNoticeBox}>
              <Text style={s.infoNoticeTitle}>What happens next?</Text>
              <Text style={s.infoNoticeDesc}>
                1. Administrators verify your club/organization credentials.{'\n'}
                2. Once approved, the Organizer Workspace unlocks instantly on your profile.{'\n'}
                3. You will receive an in-app alert notification.
              </Text>
            </View>

            <Pressable
              style={s.secondaryBtn}
              onPress={loadApplicationStatus}
            >
              <Text style={s.secondaryBtnText}>🔄 Refresh Status</Text>
            </Pressable>
          </View>
        ) : (
          /* ============================================================= */
          /* STATE C: Fresh Application Form                             */
          /* ============================================================= */
          <View>
            {existingApplication && existingApplication.status === 'REJECTED' && (
              <View style={s.rejectedNotice}>
                <Text style={s.rejectedTitle}>Previous Application Declined</Text>
                <Text style={s.rejectedBody}>
                  {existingApplication.adminFeedback ||
                    'Please ensure you provide verifiable club information and past tournament experience.'}
                </Text>
              </View>
            )}

            {/* Banner Header */}
            <View style={s.banner}>
              <Text style={s.bannerTag}>BECOME A CERTIFIED HOST</Text>
              <Text style={s.bannerTitle}>Host Tournaments on SportLK</Text>
              <Text style={s.bannerDesc}>
                Gain full access to create leagues, coordinate Sri Lankan venues, approve team
                rosters, and manage live match progression.
              </Text>
            </View>

            {/* Form Container */}
            <View style={s.card}>
              <Text style={s.formSectionTitle}>1. Organization Details</Text>

              <Text style={s.fieldLabel}>ORGANIZATION / CLUB NAME *</Text>
              <TextInput
                style={s.textInput}
                placeholder="e.g. Colombo Super Futsal Academy"
                placeholderTextColor={COLORS.placeholder}
                value={organization}
                onChangeText={setOrganization}
              />

              <Text style={s.fieldLabel}>PRIMARY CITY / DISTRICT *</Text>
              <TextInput
                style={s.textInput}
                placeholder="e.g. Colombo, Kandy, Galle"
                placeholderTextColor={COLORS.placeholder}
                value={city}
                onChangeText={setCity}
              />

              <Text style={s.fieldLabel}>PRIMARY SPORTS CATEGORIES</Text>
              <View style={s.chipRow}>
                {SPORTS_OPTIONS.map((sport) => {
                  const active = selectedSports.includes(sport.id);
                  return (
                    <Pressable
                      key={sport.id}
                      style={[s.chip, active && s.chipActive]}
                      onPress={() => toggleSport(sport.id)}
                    >
                      <Text style={s.chipIcon}>{sport.icon}</Text>
                      <Text style={[s.chipLabel, active && s.chipLabelActive]}>
                        {sport.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={s.formSectionTitle}>2. Track Record & Experience</Text>

              <Text style={s.fieldLabel}>YEARS OF TOURNAMENT MANAGEMENT</Text>
              <View style={s.experienceRow}>
                {EXPERIENCE_LEVELS.map((lvl) => {
                  const active = experienceLevel === lvl.id;
                  return (
                    <Pressable
                      key={lvl.id}
                      style={[s.expOption, active && s.expOptionActive]}
                      onPress={() => setExperienceLevel(lvl.id)}
                    >
                      <Text style={[s.expOptionText, active && s.expOptionTextActive]}>
                        {lvl.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={s.fieldLabel}>PAST EVENTS & CREDENTIALS *</Text>
              <TextInput
                style={[s.textInput, s.textArea]}
                placeholder="List major tournaments, leagues, or sports meets you or your club have successfully hosted..."
                placeholderTextColor={COLORS.placeholder}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={pastEvents}
                onChangeText={setPastEvents}
              />

              <Text style={s.fieldLabel}>OFFICIAL CONTACT / WHATSAPP NUMBER</Text>
              <TextInput
                style={s.textInput}
                placeholder="e.g. +94 77 123 4567"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="phone-pad"
                value={contactNumber}
                onChangeText={setContactNumber}
              />

              {/* Agreement */}
              <Pressable
                style={s.checkboxRow}
                onPress={() => setAgreedTerms(!agreedTerms)}
              >
                <View style={[s.checkbox, agreedTerms && s.checkboxChecked]}>
                  {agreedTerms && <Text style={s.checkmark}>✓</Text>}
                </View>
                <Text style={s.checkboxLabel}>
                  I confirm that all tournament scheduling, refereeing, and dispute rules will
                  comply with SportLK Fair-Play Guidelines.
                </Text>
              </Pressable>

              <Pressable
                style={[s.primaryBtn, submitting && s.btnDisabled]}
                disabled={submitting}
                onPress={handleSubmit}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={s.primaryBtnText}>Submit Accreditation Application  →</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
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
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  mutedText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  banner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bannerTag: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  bannerDesc: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
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
    minHeight: 90,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  chipIcon: {
    marginRight: 6,
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  chipLabelActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  experienceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  expOption: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  expOptionActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  expOptionText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  expOptionTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 10,
  },
  secondaryBtnText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  verifiedIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifiedIcon: {
    fontSize: 28,
  },
  featureBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureItem: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '600',
    marginBottom: 6,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPillTextPending: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoNoticeBox: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  infoNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  infoNoticeDesc: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  rejectedNotice: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  rejectedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 4,
  },
  rejectedBody: {
    fontSize: 12,
    color: '#991B1B',
  },
});

