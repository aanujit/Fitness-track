import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  user: { email: string; id: string } | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: { email: string; id: string } | null) => void;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  logout: async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ token: null, user: null });
  },
  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt_token');
      const userData = await SecureStore.getItemAsync('user_data');
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to restore token', e);
      set({ isLoading: false });
    }
  },
}));
