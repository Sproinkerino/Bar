import { useState, useCallback, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types';

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      // Profile doesn't exist, create it
      return await createProfile(supabaseUser);
    }

    // Update online status
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

  const loginAsGuest = useCallback(async () => {
    try {
      // Create a temporary email for guest login
      const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@demo.com`;
      const guestPassword = Math.random().toString(36).substr(2, 15);

      const { data, error } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          emailRedirectTo: undefined // Skip email confirmation
        }
      });

      if (error) {
        console.error('Guest login error:', error);
      }
    } catch (error) {
      console.error('Guest login error:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    if (user) {
      // Update online status to false
      await supabase
        .from('profiles')
        .update({ is_online: false })
        .eq('id', user.id);
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  }, [user]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user).then(setUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

  // Update online status when user becomes active/inactive
  useEffect(() => {
    if (!user) return;

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

  if (loading) {
    return {
      user: null,
      isAuthenticated: false,
      login,
      logout
    };
  }

  return {
    user,
    isAuthenticated: !!user,
    login,
    loginAsGuest,
    logout
  };
};