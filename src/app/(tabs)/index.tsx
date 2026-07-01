import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Modal, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { usePedometer } from '@/hooks/usePedometer';
import { useStepStore } from '@/store/stepStore';
import { useAuthStore } from '@/store/authStore';
import { getHealthMessage } from '@/utils/healthMessage';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { stepService } from '@/services/stepService';
import { getCurrentDateString } from '@/utils/date';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const { isPedometerAvailable, currentSteps } = usePedometer();
  const { dailyGoal, setDailyGoal, loadDailyGoal } = useStepStore();
  const { user } = useAuthStore();
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal.toString());

  useEffect(() => {
    loadDailyGoal();
  }, []);

  useEffect(() => {
    setTempGoal(dailyGoal.toString());
  }, [dailyGoal, editingGoal]); // Reset when opening modal

  // Save daily summary debounced — avoids a Firebase write on every single step.
  // Saves at most once every 30 seconds, and once more on unmount.
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      const today = getCurrentDateString();
      stepService.saveDailySummary(today, currentSteps, dailyGoal);
    }, 30000); // 30-second debounce

    return () => clearTimeout(timer);
  }, [currentSteps, dailyGoal, user]);

  const handleSaveGoal = () => {
    const goal = parseInt(tempGoal, 10);
    if (!isNaN(goal) && goal > 0) {
      setDailyGoal(goal);
    }
    setEditingGoal(false);
  };

  const progress = dailyGoal > 0 ? Math.min(currentSteps / dailyGoal, 1) : 0;
  const radius = 90;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.greetingTitle}>Hello, {user?.email?.split('@')[0] || 'Athlete'}</Text>
          <Text style={styles.greetingSubtitle}>Let's crush your goals today!</Text>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.cardTitle}>Today's Progress</Text>

          {isPedometerAvailable === 'checking' && <ActivityIndicator style={{ marginVertical: 20 }} color="#4ade80" />}
          {isPedometerAvailable === 'denied' && (
            <Text style={styles.errorText}>Motion permission denied in settings.</Text>
          )}

          <View style={styles.progressContainer}>
            <Svg width={240} height={240} viewBox="0 0 240 240">
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#4ade80" stopOpacity="1" />
                  <Stop offset="1" stopColor="#10b981" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Circle
                cx="120"
                cy="120"
                r={radius}
                stroke="#1f2937"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx="120"
                cy="120"
                r={radius}
                stroke="url(#grad)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 120 120)"
              />
            </Svg>
            <View style={styles.progressTextContainer}>
              <Text style={styles.stepsText}>{currentSteps.toLocaleString()}</Text>
              <Text style={styles.stepsLabel}>Steps</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Goal</Text>
              <Text style={styles.statValue}>{dailyGoal.toLocaleString()}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>

          <Text style={styles.healthMessage}>{getHealthMessage(currentSteps, dailyGoal)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.editGoalBtnWrapper} 
          activeOpacity={0.8}
          onPress={() => setEditingGoal(true)}
        >
          <ExpoLinearGradient 
            colors={['#1f2937', '#111827']} 
            style={styles.editGoalGradient} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.editGoalBtnText}>Update Daily Goal</Text>
          </ExpoLinearGradient>
        </TouchableOpacity>

      </ScrollView>

      {/* Goal Edit Modal */}
      <Modal visible={editingGoal} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Goal</Text>
            <Text style={styles.modalSubtitle}>How many steps do you want to conquer today?</Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempGoal}
              onChangeText={setTempGoal}
              keyboardType="numeric"
              selectionColor="#4ade80"
              placeholderTextColor="#6b7280"
              autoFocus
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditingGoal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveGoal}>
                <Text style={styles.modalSaveText}>Save Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: '#171717',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#262626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e5e5e5',
    marginBottom: 24,
    alignSelf: 'flex-start',
    letterSpacing: -0.2,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1.5,
  },
  stepsLabel: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: -4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#0f0f0f',
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f3f4f6',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#262626',
  },
  healthMessage: {
    fontSize: 15,
    color: '#4ade80',
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  editGoalBtnWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  editGoalGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editGoalBtnText: {
    color: '#f3f4f6',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#171717',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#0a0a0a',
    color: '#4ade80',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#262626',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#4ade80',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#064e3b',
    fontSize: 16,
    fontWeight: '800',
  }
});
