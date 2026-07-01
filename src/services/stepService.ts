import { stepApi, StepHistoryRecord } from '../api/stepApi';

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
};
