import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS_KEY = 'focustrack_mock_users';
const CURRENT_USER_KEY = 'focustrack_current_user';

// Demo users
const DEMO_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'user_2',
    name: 'Zeynep Kaya',
    email: 'zeynep@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'user_3',
    name: 'Mehmet Demir',
    email: 'mehmet@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
    createdAt: new Date('2024-02-01').toISOString(),
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize demo users
  useEffect(() => {
    const existingUsers = safeGetItem<User[]>(MOCK_USERS_KEY, []);
    if (existingUsers.length === 0) {
      safeSetItem(MOCK_USERS_KEY, DEMO_USERS);
    }
  }, []);

  // Load saved session
  useEffect(() => {
    const savedUser = safeGetItem<User | null>(CURRENT_USER_KEY, null);
    if (savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, _password: string): boolean => {
    const users = safeGetItem<User[]>(MOCK_USERS_KEY, []);
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      safeSetItem(CURRENT_USER_KEY, foundUser);
      return true;
    }
    return false;
  }, []);

  const register = useCallback((name: string, email: string, _password: string): boolean => {
    const users = safeGetItem<User[]>(MOCK_USERS_KEY, []);
    
    if (users.some(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    safeSetItem(MOCK_USERS_KEY, users);
    
    setUser(newUser);
    setIsAuthenticated(true);
    safeSetItem(CURRENT_USER_KEY, newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    safeRemoveItem(CURRENT_USER_KEY);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      safeSetItem(CURRENT_USER_KEY, updatedUser);
      
      const users = safeGetItem<User[]>(MOCK_USERS_KEY, []);
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      safeSetItem(MOCK_USERS_KEY, updatedUsers);
    }
  }, [user]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
