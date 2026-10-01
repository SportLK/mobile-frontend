import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export const ExploreScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Events</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.eventCard}>
          <View style={styles.badge}><Text style={styles.badgeText}>Open</Text></View>
          <Text style={styles.title}>Colombo Cricket Premier League</Text>
          <Text style={styles.sub}>📅 Sep 28 – Oct 15, 2026 • 📍 SSC Grounds, Colombo</Text>
          <Text style={styles.price}>LKR 2,500 entry</Text>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>View & Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventCard}>
          <View style={styles.badge}><Text style={styles.badgeText}>Open</Text></View>
          <Text style={styles.title}>National Football League – Div A</Text>
          <Text style={styles.sub}>📅 Oct 5 – Nov 20, 2026 • 📍 Sugathadasa Stadium</Text>
          <Text style={styles.price}>LKR 3,000 entry</Text>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>View & Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  content: { padding: 16 },
  eventCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  badge: { backgroundColor: '#DCFCE7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#15803D' },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#64748B', marginVertical: 4 },
  price: { fontSize: 14, fontWeight: '700', color: '#1E40AF', marginBottom: 12 },
  btn: { backgroundColor: '#1E40AF', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
