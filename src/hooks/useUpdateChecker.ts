import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export function useUpdateChecker() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        if (__DEV__) {
          // Updates don't work in dev mode
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Update Available',
            'A new version of the app has been downloaded. Restart the app to apply it.',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Restart Now', onPress: () => Updates.reloadAsync() },
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        // You can also add an alert or error log here
        console.error('Error checking for updates:', error);
      }
    }

    checkForUpdates();
  }, []);
}
