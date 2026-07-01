import { stepApi, StepHistoryRecord } from '../api/stepApi';
import { formatDateString } from '../utils/date';

export type { StepHistoryRecord };

export const stepService = {
  async saveDailySummary(date: string, steps: number, goal: number) {
    try {
      await stepApi.saveDailySummary(date, steps, goal);
    } catch (e) {
      console.error('Failed to save daily step summary', e);
    }
  },

  async getHistory(): Promise<StepHistoryRecord[]> {
    try {
      return await stepApi.getHistory();
    } catch (e) {
      console.error('Failed to load step history', e);
      return [];
    }
  },

  // Mock function to generate 14 days of dummy data for the chart, writing to Firebase
  async generateMockHistory() {
    try {
      const today = new Date();
      for (let i = 1; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = formatDateString(d);
        
        await stepApi.saveDailySummary(
          dateStr,
          Math.floor(Math.random() * 12000) + 1000,
          10000
        );
      }
      console.log('Successfully generated mock history in Firebase');
    } catch (e) {
      console.error('Failed to generate mock history in Firebase', e);
    }
  }
};
