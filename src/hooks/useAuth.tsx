import { useState } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const loginAsGuest = () => {
    console.log('Creating guest user...');
    
    const avatarUrls = [
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    ];

    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: `Guest${Math.floor(Math.random() * 10000)}`,
      avatar: avatarUrls[Math.floor(Math.random() * avatarUrls.length)],
      aura: Math.floor(Math.random() * 50) + 10,
      isOnline: true
    };

    console.log('Setting user:', guestUser);
    setUser(guestUser);
  };

  const login = () => {
    console.log('OAuth login not implemented yet');
  };

  const logout = () => {
    setUser(null);
  };

  console.log('useAuth - current user:', user?.name || 'none');

  return {
    user,
    isAuthenticated: !!user,
    login,
    loginAsGuest,
    logout
  };
};