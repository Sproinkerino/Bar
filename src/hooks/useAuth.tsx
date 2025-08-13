import { useState, useCallback, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types';

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('useAuth hook - current user:', user?.name || 'null', 'loading:', loading);

  const createProfile = async (supabaseUser: SupabaseUser) => {
    const avatarUrls = [
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    ];

    const randomAvatar = avatarUrls[Math.floor(Math.random() * avatarUrls.length)];
    const randomName = `User${Math.floor(Math.random() * 10000)}`;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: supabaseUser.id,
        name: randomName,
        avatar: randomAvatar,
        aura: Math.floor(Math.random() * 50) + 10,
        is_online: true
      });

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return {
      id: supabaseUser.id,
      name: randomName,
      avatar: randomAvatar,
      aura: Math.floor(Math.random() * 50) + 10,
      isOnline: true
    };
  };

  const fetchProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) {
      return await createProfile(supabaseUser);
    }

    await supabase
      .from('profiles')
      .update({ is_online: true })
      .eq('id', supabaseUser.id);

    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar || '',
      aura: data.aura,
      isOnline: data.is_online
    };
  };

  const login = useCallback(async (provider: 'google' | 'instagram') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'instagram' ? 'google' : provider,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Login error:', error);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }, []);

  const loginAsGuest = useCallback(() => {
    console.log('Guest login clicked');
    
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
    setLoading(false);
    console.log('Guest user created and set');
  }, []);

  const logout = useCallback(async () => {
    if (user && !user.id.startsWith('guest_')) {
      await supabase
        .from('profiles')
        .update({ is_online: false })
        .eq('id', user.id);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    }
    
    setUser(null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    console.log('useAuth useEffect - initializing auth state');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session ? 'exists' : 'none');
      if (session?.user) {
        fetchProfile(session.user).then((profile) => {
          console.log('Profile fetched:', profile?.name || 'null');
          setUser(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'session exists' : 'no session');
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || user.id.startsWith('guest_')) return;

    const updateOnlineStatus = (isOnline: boolean) => {
      supabase
        .from('profiles')
        .update({ is_online: isOnline })
        .eq('id', user.id);
    };

    const handleVisibilityChange = () => {
      updateOnlineStatus(!document.hidden);
    };

    const handleBeforeUnload = () => {
      updateOnlineStatus(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const isAuthenticated = !!user;
  
  console.log('useAuth returning - user:', user?.name || 'null', 'isAuthenticated:', isAuthenticated, 'loading:', loading);

  return {
    user,
    isAuthenticated,
    login,
    loginAsGuest,
    logout
  };
};