import { useState, useCallback, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const loginAsGuest = useCallback(() => {
    const avatarUrls = [
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    ];

    const guestUser: User = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Guest${Math.floor(Math.random() * 10000)}`,
      avatar: avatarUrls[Math.floor(Math.random() * avatarUrls.length)],
      aura: Math.floor(Math.random() * 50) + 10,
      isOnline: true
    };

    console.log('Creating guest user:', guestUser);
    setUser(guestUser);
  }, []);

  const login = useCallback((provider: 'google' | 'instagram') => {
    console.log(`OAuth login with ${provider} not implemented yet`);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Auth state changed - user:', user ? user.name : 'null');
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    login,
    loginAsGuest,
    logout
  };
};