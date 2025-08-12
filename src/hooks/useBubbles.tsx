import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Bubble, User } from '../types';

export const useBubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const animationRef = useRef<number>();

  const fetchBubbles = useCallback(async () => {
    const { data, error } = await supabase
      .from('bubbles')
      .select(`
        *,
        profiles (
          id,
          name,
          avatar,
          aura,
          is_online
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching bubbles:', error);
      return;
    }

    const formattedBubbles: Bubble[] = data.map(bubble => ({
      id: bubble.id,
      userId: bubble.user_id,
      message: bubble.message,
      timestamp: new Date(bubble.created_at),
      x: Number(bubble.x),
      y: Number(bubble.y),
      vx: Number(bubble.vx),
      vy: Number(bubble.vy),
      reactions: bubble.reactions,
      user: {
        id: bubble.profiles.id,
        name: bubble.profiles.name,
        avatar: bubble.profiles.avatar || '',
        aura: bubble.profiles.aura,
        isOnline: bubble.profiles.is_online
      }
    }));

    setBubbles(formattedBubbles);
  }, []);

  const addBubble = useCallback(async (message: string, user: User) => {
    const x = Math.random() * (window.innerWidth - 200) + 100;
    const y = Math.random() * (window.innerHeight - 300) + 150;
    const vx = (Math.random() - 0.5) * 0.05;
    const vy = (Math.random() - 0.5) * 0.05;

    const { data, error } = await supabase
      .from('bubbles')
      .insert({
        user_id: user.id,
        message,
        x,
        y,
        vx,
        vy,
        reactions: 0
      })
      .select(`
        *,
        profiles (
          id,
          name,
          avatar,
          aura,
          is_online
        )
      `)
      .single();

    if (error) {
      console.error('Error adding bubble:', error);
      return;
    }

    const newBubble: Bubble = {
      id: data.id,
      userId: data.user_id,
      message: data.message,
      timestamp: new Date(data.created_at),
      x: Number(data.x),
      y: Number(data.y),
      vx: Number(data.vx),
      vy: Number(data.vy),
      reactions: data.reactions,
      user: {
        id: data.profiles.id,
        name: data.profiles.name,
        avatar: data.profiles.avatar || '',
        aura: data.profiles.aura,
        isOnline: data.profiles.is_online
      }
    };

    setBubbles(prev => [newBubble, ...prev].slice(0, 20));
  }, []);

  const addReaction = useCallback(async (bubbleId: string) => {
    const { error } = await supabase
      .from('bubbles')
      .update({ reactions: supabase.sql`reactions + 1` })
      .eq('id', bubbleId);

    if (error) {
      console.error('Error adding reaction:', error);
      return;
    }

    // Also update user's aura
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (bubble) {
      await supabase
        .from('profiles')
        .update({ aura: supabase.sql`aura + 1` })
        .eq('id', bubble.userId);
    }

    setBubbles(prev => prev.map(bubble => 
      bubble.id === bubbleId 
        ? { ...bubble, reactions: bubble.reactions + 1, user: { ...bubble.user, aura: bubble.user.aura + 1 } }
        : bubble
    ));
  }, [bubbles]);

  const updateBubblePositions = useCallback(async (updatedBubbles: Bubble[]) => {
    // Batch update positions in database
    const updates = updatedBubbles.map(bubble => ({
      id: bubble.id,
      x: bubble.x,
      y: bubble.y,
      vx: bubble.vx,
      vy: bubble.vy
    }));

    // Update positions in batches to avoid too many requests
    if (updates.length > 0) {
      const { error } = await supabase
        .from('bubbles')
        .upsert(updates);

      if (error) {
        console.error('Error updating bubble positions:', error);
      }
    }
  }, []);

  // Animation loop
  useEffect(() => {
    let lastUpdate = Date.now();
    
    const animate = () => {
      const now = Date.now();
      
      setBubbles(prev => {
        const updated = prev.map(bubble => {
          let newX = bubble.x + bubble.vx;
          let newY = bubble.y + bubble.vy;
          let newVx = bubble.vx;
          let newVy = bubble.vy;

          // Bounce off walls
          if (newX <= 50 || newX >= window.innerWidth - 250) {
            newVx = -newVx;
            newX = Math.max(50, Math.min(window.innerWidth - 250, newX));
          }
          if (newY <= 50 || newY >= window.innerHeight - 200) {
            newVy = -newVy;
            newY = Math.max(50, Math.min(window.innerHeight - 200, newY));
          }

          // Check collision with other bubbles
          prev.forEach(otherBubble => {
            if (otherBubble.id !== bubble.id) {
              const dx = newX - otherBubble.x;
              const dy = newY - otherBubble.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = 120;
              
              if (distance < minDistance) {
                const angle = Math.atan2(dy, dx);
                const force = (minDistance - distance) * 0.0002;
                newVx += Math.cos(angle) * force;
                newVy += Math.sin(angle) * force;
              }
            }
          });

          // Apply friction
          newVx *= 0.999;
          newVy *= 0.999;

          return {
            ...bubble,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy
          };
        });

        // Update positions in database every 5 seconds
        if (now - lastUpdate > 5000) {
          updateBubblePositions(updated);
          lastUpdate = now;
        }

        return updated;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    if (bubbles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bubbles.length, updateBubblePositions]);

  // Fetch bubbles on mount
  useEffect(() => {
    fetchBubbles();
  }, [fetchBubbles]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('bubbles')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bubbles' },
        (payload) => {
          // Fetch the new bubble with profile data
          supabase
            .from('bubbles')
            .select(`
              *,
              profiles (
                id,
                name,
                avatar,
                aura,
                is_online
              )
            `)
            .eq('id', payload.new.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                const newBubble: Bubble = {
                  id: data.id,
                  userId: data.user_id,
                  message: data.message,
                  timestamp: new Date(data.created_at),
                  x: Number(data.x),
                  y: Number(data.y),
                  vx: Number(data.vx),
                  vy: Number(data.vy),
                  reactions: data.reactions,
                  user: {
                    id: data.profiles.id,
                    name: data.profiles.name,
                    avatar: data.profiles.avatar || '',
                    aura: data.profiles.aura,
                    isOnline: data.profiles.is_online
                  }
                };

                setBubbles(prev => {
                  // Avoid duplicates
                  if (prev.some(b => b.id === newBubble.id)) return prev;
                  return [newBubble, ...prev].slice(0, 20);
                });
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    bubbles,
    addBubble,
    addReaction,
    fetchBubbles
  };
};