import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

export const authService = {
  async signup(email: string, password: string) {
    try {
      const userCredential = await authApi.signup(email, password);
      
      const token = await userCredential.user.getIdToken();
      const user = { 
        email: userCredential.user.email || email, 
        id: userCredential.user.uid 
      };

      await SecureStore.setItemAsync('jwt_token', token);
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));

      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser(user);

      return { user, token };
    } catch (error: any) {
      // Firebase throws errors with detailed messages, let's pass them along
      throw new Error(error.message || 'Signup failed');
    }
  },

  async login(email: string, password: string) {
    try {
      const userCredential = await authApi.login(email, password);

      const token = await userCredential.user.getIdToken();
      const user = { 
        email: userCredential.user.email || email, 
        id: userCredential.user.uid 
      };

      await SecureStore.setItemAsync('jwt_token', token);
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));

      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser(user);

      return { user, token };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  async logout() {
    try {
      await authApi.logout();
      await useAuthStore.getState().logout();
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }
};
