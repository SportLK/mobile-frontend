import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useTeamContext } from '../../context/TeamContext';
import { SportType } from '../../types';

interface CreateTeamScreenProps {
  onBack: () => void;
  onSuccess: (teamId: string) => void;
}

export const CreateTeamScreen: React.FC<CreateTeamScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const { createTeam } = useTeamContext();

  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState<SportType>('Cricket');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('20');
  const [selectedLogo, setSelectedLogo] = useState('🛡️');

  const sportsList: SportType[] = ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Tennis', 'Athletics', 'Rugby'];
  const logoOptions = ['🛡️', '⚡', '👑', '🦁', '🦅', '🔥', '🌊', '⚽', '🏏'];

  const handleSubmit = () => {
    if (!teamName.trim()) {
      Alert.alert('Validation Error', 'Please enter a team name.');
      return;
    }
    if (!district.trim()) {
      Alert.alert('Validation Error', 'Please enter district / city.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a team description.');
      return;
    }

    const created = createTeam({
      name: teamName.trim(),
      sport,
      district: district.trim(),
      description: description.trim(),
      contactInfo: contactInfo.trim() || '+94 77 123 4567',
      maxPlayers: Number(maxPlayers) || 20,
      logo: selectedLogo,
    });

    Alert.alert('Success 🎉', `Team "${created.name}" created successfully!`, [
      { text: 'View Team', onPress: () => onSuccess(created.id) }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a Team</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Team Logo Upload Placeholder Box */}
        <View style={styles.logoSection}>
          <View style={styles.logoDottedBox}>
            <Text style={styles.logoPreview}>{selectedLogo}</Text>
            <Text style={styles.logoLabel}>Team Logo</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logoPicker}>
            {logoOptions.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[styles.emojiChip, selectedLogo === emoji && styles.emojiChipSelected]}
                onPress={() => setSelectedLogo(emoji)}
              >
                <Text style={{ fontSize: 20 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Fields */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Team Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter team name..."
            placeholderTextColor="#94A3B8"
            value={teamName}
            onChangeText={setTeamName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Sport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {sportsList.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.sportChip, sport === item && styles.sportChipActive]}
                onPress={() => setSport(item)}
              >
                <Text style={[styles.sportChipText, sport === item && styles.sportChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>District / City</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter district / city..."
            placeholderTextColor="#94A3B8"
            value={district}
            onChangeText={setDistrict}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Team Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Enter team description..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Contact Info</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter contact info..."
            placeholderTextColor="#94A3B8"
            value={contactInfo}
            onChangeText={setContactInfo}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Max Players</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter max players..."
            placeholderTextColor="#94A3B8"
            value={maxPlayers}
            onChangeText={setMaxPlayers}
            keyboardType="number-pad"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>Create Team 🚀</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoDottedBox: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4ADE80',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoPreview: {
    fontSize: 40,
  },
  logoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    marginTop: 4,
  },
  logoPicker: {
    flexDirection: 'row',
  },
  emojiChip: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emojiChipSelected: {
    borderColor: '#1E40AF',
    backgroundColor: '#EFF6FF',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
  },
  sportChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sportChipActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  sportChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  sportChipTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
