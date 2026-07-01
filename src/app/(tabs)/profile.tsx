import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const { logout, user } = useAuthStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || 'Unknown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user?.id || 'Unknown'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#aaa',
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
