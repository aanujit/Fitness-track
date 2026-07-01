import { useState, useEffect, useRef, useCallback } from 'react';
import { Pedometer } from 'expo-sensors';
import { useStepStore } from '../store/stepStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEPS_CACHE_KEY = 'cached_step_count';
const STEPS_CACHE_DATE_KEY = 'cached_step_date';

/**
 * Returns today's date string in YYYY-MM-DD format (local time).
 */
const getTodayString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const usePedometer = () => {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<string>('checking');
  const { currentSteps, setCurrentSteps } = useStepStore();

  // Use a ref to hold the historical (past) steps so the watchStepCount
  // callback always sees the latest value — avoids stale closure bug.
  const pastStepsRef = useRef<number>(0);

  /**
   * Persist the current step count to AsyncStorage so that if the app is
   * killed and restarted, we don't lose the count (especially important
   * on Android where historical queries can fail).
   */
  const cacheSteps = useCallback(async (steps: number) => {
    try {
      await AsyncStorage.setItem(STEPS_CACHE_KEY, steps.toString());
      await AsyncStorage.setItem(STEPS_CACHE_DATE_KEY, getTodayString());
    } catch {
      // Best-effort caching
    }
  }, []);

  /**
   * Restore cached steps if they are from today. Returns 0 if the cache
   * is stale or missing.
   */
  const restoreCachedSteps = useCallback(async (): Promise<number> => {
    try {
      const [cachedCount, cachedDate] = await Promise.all([
        AsyncStorage.getItem(STEPS_CACHE_KEY),
        AsyncStorage.getItem(STEPS_CACHE_DATE_KEY),
      ]);
      if (cachedDate === getTodayString() && cachedCount) {
        return parseInt(cachedCount, 10) || 0;
      }
    } catch {
      // Ignore
    }
    return 0;
  }, []);

  useEffect(() => {
    let subscription: any;
    let isMounted = true;

    const subscribe = async () => {
      try {
        const { status } = await Pedometer.requestPermissionsAsync();

        if (!isMounted) return;

        if (status !== 'granted') {
          setIsPedometerAvailable('denied');
          return;
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isMounted) return;
        setIsPedometerAvailable(String(isAvailable));

        if (isAvailable) {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);

          let pastSteps = 0;

          // ── Fetch historical steps (works on BOTH iOS and Android) ──
          try {
            const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
            if (pastStepCountResult) {
              pastSteps = pastStepCountResult.steps;
            }
          } catch (error) {
            console.warn('Could not get historical steps from sensor, falling back to cache', error);
            // Fallback: restore whatever we last persisted for today
            pastSteps = await restoreCachedSteps();
          }

          // Store in ref so the live callback always sees the latest value
          pastStepsRef.current = pastSteps;

          if (!isMounted) return;
          setCurrentSteps(pastSteps);
          cacheSteps(pastSteps);

          // ── Subscribe to LIVE step updates ──
          // watchStepCount returns steps counted SINCE the subscription
          // started, so we add them on top of the historical count.
          subscription = Pedometer.watchStepCount(result => {
            const total = pastStepsRef.current + result.steps;
            setCurrentSteps(total);
            cacheSteps(total);
          });
        }
      } catch (error) {
        console.error('Pedometer subscription failed', error);
        if (isMounted) {
          setIsPedometerAvailable('error');
        }
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, [setCurrentSteps, cacheSteps, restoreCachedSteps]);

  return {
    isPedometerAvailable,
    currentSteps,
  };
};
