import { useAuthContext } from '../store/authStore';
import { authService } from '../services/authService';
import type { LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { useState } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, accessToken, dispatch } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.login(credentials);
      dispatch({ type: 'LOGIN', payload: res.data });
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to login';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.register(credentials);
      dispatch({ type: 'LOGIN', payload: res.data });
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to register';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      dispatch({ type: 'LOGOUT' });
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    accessToken,
    loading,
    error,
    login,
    register,
    logout,
  };
};
