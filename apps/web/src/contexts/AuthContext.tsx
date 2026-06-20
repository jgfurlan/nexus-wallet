import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const savedToken = localStorage.getItem('nexus_token');
    const savedUser = localStorage.getItem('nexus_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('nexus_token', newToken);
    localStorage.setItem('nexus_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
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
