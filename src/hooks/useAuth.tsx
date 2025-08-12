import { useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '../types';

const mockUsers: User[] = [
  {
    id: '1',
    name: 'ArtisticSoul',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    aura: 42,
    isOnline: true
  },
  {
    id: '2',
    name: 'TechExplorer',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    aura: 38,
    isOnline: true
  },
  {
    id: '3',
    name: 'DreamCatcher',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    aura: 51,
    isOnline: false
  },
  {
    id: '4',
    name: 'VibeSeeker',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    aura: 29,
    isOnline: true
  }
];

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((provider: 'google' | 'instagram') => {
    // Mock login - in production this would handle OAuth
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const loggedInUser = {
      ...randomUser,
      id: Date.now().toString(),
      name: `${randomUser.name}${Math.floor(Math.random() * 100)}`,
      isOnline: true
    };
    
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  useEffect(() => {
    // Auto-login for demo purposes
    if (!user) {
      setTimeout(() => login('google'), 1000);
    }
  }, [user, login]);

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout
  };
};