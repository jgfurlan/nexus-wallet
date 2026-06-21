import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Logged in user profile representation.
 */
interface User {
  /** The unique identifier of the user */
  id: string;
  /** The email address of the user */
  email: string;
}

/**
 * AuthContextType defines the states and functions for session authentication.
 * Authentication is managed entirely via HttpOnly cookies — no tokens in client state.
 */
interface AuthContextType {
  /** The profile of the currently logged in user, or null */
  user: User | null;
  /** Stores user profile in context after successful login */
  login: (user: User) => void;
  /** Clears the session cookie via backend and resets context */
  logout: () => void;
  /** True if the user is authenticated */
  isAuthenticated: boolean;
  /** True if session check on initial load is still running */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider wraps the application, validating the HttpOnly cookie session
 * via GET /auth/me on mount and providing login/logout states to components.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Valida a sessão no mount checando o cookie HttpOnly com o backend
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch {
        // Cookie ausente, expirado ou inválido — usuário não autenticado
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Failed to logout', e);
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access the AuthContext properties (current user, authentication methods).
 * 
 * @returns The AuthContext properties.
 * @throws {Error} If used outside of an AuthProvider wrapper.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
