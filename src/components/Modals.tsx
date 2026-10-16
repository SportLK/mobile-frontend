import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../theme';
import { useTeamContext, TeamProfile, SquadMember } from '../context/TeamContext';

// ----------------------------------------------------
// 1. Create Team Modal
// ----------------------------------------------------
interface CreateTeamModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ visible, onClose }) => {
  const { createTeam } = useTeamContext();
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState<TeamProfile['sport']>('Futsal');
  const [level, setLevel] = useState<TeamProfile['level']>('Intermediate');
  const [city, setCity] = useState('Colombo');
  const [bio, setBio] = useState('');

  const sports: TeamProfile['sport'][] = ['Futsal', 'Cricket', 'Badminton', 'Basketball'];
  const levels: TeamProfile['level'][] = ['Beginner', 'Intermediate', 'Advanced'];

  const handleSave = () => {
    if (!teamName.trim()) return;

    createTeam({
      name: teamName,
      sport,
      location: city,
      level,
      bio: bio || `A ${city}-based ${sport.toLowerCase()} squad.`,
    });

    setTeamName('');
    setBio('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Team</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Team Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Colombo Titans"
              placeholderTextColor={COLORS.gray400}
              value={teamName}
              onChangeText={setTeamName}
            />

            <Text style={styles.label}>Sport Type</Text>
            <View style={styles.pillRow}>
              {sports.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, sport === s && styles.pillActive]}
                  onPress={() => setSport(s)}
                >
                  <Text style={[styles.pillText, sport === s && styles.pillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.pillRow}>
              {levels.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.pill, level === l && styles.pillActive]}
                  onPress={() => setLevel(l)}
                >
                  <Text style={[styles.pillText, level === l && styles.pillTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Primary City / Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Colombo, Kandy, Galle"
              placeholderTextColor={COLORS.gray400}
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.label}>Team Bio / Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your team training schedule and philosophy..."
              placeholderTextColor={COLORS.gray400}
              multiline
              numberOfLines={3}
              value={bio}
              onChangeText={setBio}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
              <Text style={styles.primaryBtnText}>Create Team</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ----------------------------------------------------
// 2. Edit Team Modal
// ----------------------------------------------------
interface EditTeamModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({ visible, onClose }) => {
  const { activeTeam, updateTeam } = useTeamContext();
  const [name, setName] = useState(activeTeam.name);
  const [location, setLocation] = useState(activeTeam.location);
  const [bio, setBio] = useState(activeTeam.bio);

  const handleUpdate = () => {
    updateTeam({ name, location, bio });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Team Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Team Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Primary Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Team Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              value={bio}
              onChangeText={setBio}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdate}>
              <Text style={styles.primaryBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ----------------------------------------------------
// 3. Invite Player Modal
// ----------------------------------------------------
interface InvitePlayerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InvitePlayerModal: React.FC<InvitePlayerModalProps> = ({ visible, onClose }) => {
  const { sendInvitation } = useTeamContext();
  const [name, setName] = useState('');
  const [role, setRole] = useState<SquadMember['role']>('Forward');
  const [jersey, setJersey] = useState('');

  const roles: SquadMember['role'][] = [
    'Captain',
    'Vice-Captain',
    'Forward',
    'Midfielder',
    'Defender',
    'Goalkeeper',
    'Squad Player',
  ];

  const handleInvite = () => {
    if (!name.trim()) return;
    sendInvitation(name, role, jersey ? parseInt(jersey, 10) : undefined);
    setName('');
    setJersey('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Player to Squad</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Player Name or Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Nuwan Pradeep"
              placeholderTextColor={COLORS.gray400}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Position / Role</Text>
            <View style={styles.pillRow}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.pill, role === r && styles.pillActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.pillText, role === r && styles.pillTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Jersey Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9"
              placeholderTextColor={COLORS.gray400}
              keyboardType="number-pad"
              value={jersey}
              onChangeText={setJersey}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleInvite}>
              <Text style={styles.primaryBtnText}>Send Invitation</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ----------------------------------------------------
// 4. Create Challenge Modal
// ----------------------------------------------------
interface CreateChallengeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ visible, onClose }) => {
  const { activeTeam, createChallenge } = useTeamContext();
  const [opponent, setOpponent] = useState('');
  const [sport, setSport] = useState(`${activeTeam.sport} · ${activeTeam.level}`);
  const [dateVenue, setDateVenue] = useState('20 Oct · 6:00 PM · Colombo Sports Arena');

  const handleCreate = () => {
    if (!opponent.trim()) return;
    createChallenge(opponent, sport, dateVenue);
    setOpponent('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Team Challenge</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Opponent Team Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Galle Titans"
              placeholderTextColor={COLORS.gray400}
              value={opponent}
              onChangeText={setOpponent}
            />

            <Text style={styles.label}>Sport & Level</Text>
            <TextInput
              style={styles.input}
              value={sport}
              onChangeText={setSport}
            />

            <Text style={styles.label}>Proposed Date, Time & Venue</Text>
            <TextInput
              style={styles.input}
              value={dateVenue}
              onChangeText={setDateVenue}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate}>
              <Text style={styles.primaryBtnText}>Send Challenge</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.black,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
  },
  pillActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  pillTextActive: {
    color: COLORS.white,
  },
  primaryBtn: {
    backgroundColor: COLORS.black,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
