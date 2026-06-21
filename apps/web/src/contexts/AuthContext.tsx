import React, { createContext, useContext, useState, useEffect } from 'react';
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
 */
interface AuthContextType {
  /** The profile of the currently logged in user, or null */
  user: User | null;
  /** The active authentication JWT access token, or null */
  token: string | null;
  /** Stores token and user profile in context and localStorage */
  login: (token: string, user: User) => void;
  /** Clears the session from context and localStorage */
  logout: () => void;
  /** True if the user is authenticated */
  isAuthenticated: boolean;
  /** True if session check on initial load is still running */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider wraps the application, reading saved token credentials
 * from localStorage and providing login/logout states to components.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');

    if (savedUser) {
      // Token is assumed to be in the HttpOnly cookie.
      // If the API rejects it with 401, the interceptor will clear the user.
      setUser(JSON.parse(savedUser));
      setToken('http-only-cookie');
    }
    setIsLoading(false);
  }, []);

  const login = (_newToken: string, newUser: User) => {
    // newToken is still passed by auth service but we don't store it in localStorage
    setToken('http-only-cookie');
    setUser(newUser);
    localStorage.setItem('nexus_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Failed to logout', e);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('nexus_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
 * Hook to access the AuthContext properties (current user, token, authentication methods).
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
