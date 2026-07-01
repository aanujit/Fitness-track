import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StepState {
  dailyGoal: number;
  currentSteps: number;
  setDailyGoal: (goal: number) => Promise<void>;
  setCurrentSteps: (steps: number) => void;
  loadDailyGoal: () => Promise<void>;
}

export const useStepStore = create<StepState>((set) => ({
  dailyGoal: 10000,
  currentSteps: 0,
  setDailyGoal: async (goal: number) => {
    try {
      await AsyncStorage.setItem('daily_step_goal', goal.toString());
      set({ dailyGoal: goal });
    } catch (e) {
      console.error('Failed to save daily goal', e);
    }
  },
  setCurrentSteps: (steps: number) => set({ currentSteps: steps }),
  loadDailyGoal: async () => {
    try {
      const savedGoal = await AsyncStorage.getItem('daily_step_goal');
      if (savedGoal) {
        set({ dailyGoal: parseInt(savedGoal, 10) });
      }
    } catch (e) {
      console.error('Failed to load daily goal', e);
    }
  },
}));
