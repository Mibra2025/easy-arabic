'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    name: string;
    description?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Простая проверка токена при загрузке
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await fetch('/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
            } else {
              // Токен невалиден
              localStorage.removeItem('token');
              setUser(null);
            }
          } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);


  const login = (token: string, userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    setUser(userData);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
    
    // Перенаправляем на главную страницу
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const isAuthenticated = !!user;

  const checkAuth = async (): Promise<boolean> => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          return response.ok;
        } catch (error) {
          return false;
        }
      }
    }
    return false;
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
