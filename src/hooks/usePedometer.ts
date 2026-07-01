import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { useStepStore } from '../store/stepStore';
import { Platform } from 'react-native';

export const usePedometer = () => {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<string>('checking');
  const { currentSteps, setCurrentSteps } = useStepStore();

  useEffect(() => {
    let subscription: any;

    const subscribe = async () => {
      try {
        const { status } = await Pedometer.requestPermissionsAsync();
        
        if (status !== 'granted') {
          setIsPedometerAvailable('denied');
          return;
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(String(isAvailable));

        if (isAvailable) {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);

          let pastSteps = 0;
          try {
            if (Platform.OS === 'ios') {
              const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
              if (pastStepCountResult) {
                pastSteps = pastStepCountResult.steps;
                setCurrentSteps(pastSteps);
              }
            } else {
              // Historical step count via Expo Pedometer is not supported on Android. Starting from 0.
            }
          } catch (error) {
            console.warn('Could not get past steps, starting from 0', error);
          }

          subscription = Pedometer.watchStepCount(result => {
            setCurrentSteps(pastSteps + result.steps);
          });
        }
      } catch (error) {
        console.error('Pedometer subscription failed', error);
        setIsPedometerAvailable('error');
      }
    };

    subscribe();

    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, [setCurrentSteps]);

  return {
    isPedometerAvailable,
    currentSteps,
  };
};
