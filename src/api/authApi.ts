import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

export const authApi = {
  // Register a new user with email and password
  async signup(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up with Firebase');
    }
  },

  // Log in an existing user with email and password

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to log in with Firebase');
    }
  },


  // Log out the current user

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to log out from Firebase');
    }
  }
};
