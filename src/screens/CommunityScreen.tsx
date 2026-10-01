import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export const CommunityScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.postBtn}>
          <Text style={styles.postBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.postCard}>
          <Text style={styles.author}>Tharaka Wijesinghe • 2h ago</Text>
          <Text style={styles.postBody}>
            What a match yesterday! The Colombo Lions vs Kandy Kings was absolutely breathtaking. That last over finish was pure drama! 🔥🏏
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>❤️ 142 Likes</Text>
            <Text style={styles.meta}>💬 38 Comments</Text>
          </View>
        </View>

        <View style={styles.postCard}>
          <Text style={styles.author}>Ruwan Fernando • 6h ago</Text>
          <Text style={styles.postBody}>
            Anyone looking for a football team in Colombo 3 area? We have 3 spots open for weekend friendlies. DM me!
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>❤️ 45 Likes</Text>
            <Text style={styles.meta}>💬 23 Comments</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  postBtn: { backgroundColor: '#1E40AF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  postBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  content: { padding: 16 },
  postCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  author: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  postBody: { fontSize: 13, color: '#334155', lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  meta: { fontSize: 12, color: '#64748B' },
});
