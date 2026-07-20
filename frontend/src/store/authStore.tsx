import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/user.types';
import type { AuthResponse } from '../types/auth.types';
import { setTokens, setLogoutCallback, setRefreshCallback } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import axios from 'axios';


interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: AuthResponse['data'] }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH'; payload: { accessToken: string; refreshToken: string } };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        // Giữ token cũ nếu payload không cung cấp token mới (VD: update profile)
        accessToken: action.payload.access_token || state.accessToken,
        refreshToken: action.payload.refresh_token || state.refreshToken,
        isAuthenticated: true,
      };
    case 'REFRESH':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  dispatch: React.Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitializing, setIsInitializing] = useState(true);

  // Sync state to API interceptors
  useEffect(() => {
    setTokens(state.accessToken, state.refreshToken);
  }, [state.accessToken, state.refreshToken]);

  // Sync refresh token to localStorage
  useEffect(() => {
    if (isInitializing) return;
    if (state.refreshToken) {
      localStorage.setItem('refresh_token', state.refreshToken);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }, [state.refreshToken, isInitializing]);

  // Setup callbacks from API interceptors
  useEffect(() => {
    setLogoutCallback(() => {
      dispatch({ type: 'LOGOUT' });
    });

    setRefreshCallback((accessToken, refreshToken) => {
      dispatch({ type: 'REFRESH', payload: { accessToken, refreshToken } });
    });
  }, []);

  // Run initialization sequence (silent refresh) on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedRefreshToken = localStorage.getItem('refresh_token');
      if (!savedRefreshToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

        // 1. Call silent refresh using raw axios to avoid interceptor side effects
        const response = await axios.post(`${apiBaseUrl}/auth/refresh`, {
          refresh_token: savedRefreshToken,
        });

        const newAccessToken = response.data.data.access_token;
        const newRefreshToken = response.data.data.refresh_token || savedRefreshToken;

        // 2. Set tokens temporarily so the profile request is authorized
        setTokens(newAccessToken, newRefreshToken);

        // 3. Fetch the current user profile
        const userResponse = await axios.get(`${apiBaseUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        // 4. Update state with restored session
        dispatch({
          type: 'LOGIN',
          payload: {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            user: userResponse.data.data,
          },
        });
      } catch (err) {
        console.error('Failed silent auth restoration:', err);
        localStorage.removeItem('refresh_token');
        dispatch({ type: 'LOGOUT' });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return <AuthContext.Provider value={{ ...state, dispatch }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
