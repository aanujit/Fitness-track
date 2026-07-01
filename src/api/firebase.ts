import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
// @ts-ignore - TS might not find this export in some Firebase type definitions, but it exists at runtime as confirmed by the warning
import { getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
  const persistence = getReactNativePersistence(ReactNativeAsyncStorage);
  auth = initializeAuth(app, { persistence });
} catch (error) {
  auth = getAuth(app);
}


const database = getDatabase(app);

const authInitializedPromise = new Promise<void>((resolve) => {
  const unsubscribe = auth.onAuthStateChanged(() => {
    unsubscribe();
    resolve();
  });
});

export { app, auth, database, authInitializedPromise };
