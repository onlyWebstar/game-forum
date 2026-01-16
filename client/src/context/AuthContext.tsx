// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'admin';
  bio?: string;
  level?: number;
  experience?: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => void;
  loginWithDiscord: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and fetch user data
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.user);
          } else {
            // Invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (token && window.location.pathname === '/auth/callback') {
        localStorage.setItem('token', token);
        
        // Fetch user data
        authService.getCurrentUser()
          .then((response) => {
            if (response.success) {
              setUser(response.user);
              // Redirect to home
              window.location.href = '/';
            }
          })
          .catch((error) => {
            console.error('OAuth callback error:', error);
          });
      }
    };

    handleOAuthCallback();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ username, email, password });
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const loginWithGoogle = () => {
    authService.googleLogin();
  };

  const loginWithDiscord = () => {
    authService.discordLogin();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithDiscord,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};