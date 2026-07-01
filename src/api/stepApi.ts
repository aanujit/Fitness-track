import { ref, set, get, child } from 'firebase/database';
import { database, auth, authInitializedPromise } from './firebase';

export interface StepHistoryRecord {
  date: string;
  steps: number;
  goal: number;
}

export const stepApi = {

  // Save the daily summary for the current user
  async saveDailySummary(date: string, steps: number, goal: number): Promise<void> {
    await authInitializedPromise;
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to save step data.');
    }

    try {
      const stepRef = ref(database, `users/${user.uid}/history/${date}`);
      await set(stepRef, {
        date,
        steps,
        goal
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save step summary to database.');
    }
  },

  //Get the step history for the current user
  async getHistory(): Promise<StepHistoryRecord[]> {
    await authInitializedPromise;
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to retrieve step data.');
    }

    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${user.uid}/history`));

      if (snapshot.exists()) {
        const data = snapshot.val();
        const historyArray: StepHistoryRecord[] = Object.values(data);
        return historyArray.sort((a, b) => (a.date < b.date ? 1 : -1));
      } else {
        return [];
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to retrieve step history from database.');
    }
  }
};
