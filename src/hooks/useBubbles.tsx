import { useState, useCallback, useEffect, useRef } from 'react';
import { Bubble, User } from '../types';

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
  }
];

const createInitialBubbles = (): Bubble[] => [
  {
    id: 'demo-1',
    userId: '1',
    message: 'Just discovered this amazing new art technique! ✨',
    timestamp: new Date(Date.now() - 300000),
    x: Math.random() * (window.innerWidth - 200) + 100,
    y: Math.random() * (window.innerHeight - 300) + 150,
    vx: (Math.random() - 0.5) * 0.05,
    vy: (Math.random() - 0.5) * 0.05,
    reactions: 3,
    user: mockUsers[0]
  },
  {
    id: 'demo-2',
    userId: '2',
    message: 'Good vibes only! Spreading positivity everywhere 🌟',
    timestamp: new Date(Date.now() - 180000),
    x: Math.random() * (window.innerWidth - 200) + 100,
    y: Math.random() * (window.innerHeight - 300) + 150,
    vx: (Math.random() - 0.5) * 0.05,
    vy: (Math.random() - 0.5) * 0.05,
    reactions: 7,
    user: mockUsers[1]
  },
  {
    id: 'demo-3',
    userId: '3',
    message: 'Dreams are the seeds of reality 🌱',
    timestamp: new Date(Date.now() - 120000),
    x: Math.random() * (window.innerWidth - 200) + 100,
    y: Math.random() * (window.innerHeight - 300) + 150,
    vx: (Math.random() - 0.5) * 0.05,
    vy: (Math.random() - 0.5) * 0.05,
    reactions: 12,
    user: mockUsers[2]
  }
];

export const useBubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>(createInitialBubbles);
  const animationRef = useRef<number>();

  const addBubble = useCallback((message: string, user: User) => {
    const newBubble: Bubble = {
      id: Date.now().toString(),
      userId: user.id,
      message,
      timestamp: new Date(),
      x: Math.random() * (window.innerWidth - 200) + 100,
      y: Math.random() * (window.innerHeight - 300) + 150,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
      reactions: 0,
      user
    };

    setBubbles(prev => [...prev, newBubble]);
  }, []);

  const addReaction = useCallback((bubbleId: string) => {
    setBubbles(prev => prev.map(bubble => 
      bubble.id === bubbleId 
        ? { ...bubble, reactions: bubble.reactions + 1 }
        : bubble
    ));
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setBubbles(prev => {
        return prev.map(bubble => {
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
              // Calculate repulsion force
             const angle = Math.atan2(dy, dx);
              const force = (minDistance - distance) * 0.0002;
              newVx += Math.cos(angle) * force;
              newVy += Math.sin(angle) * force;
            }
          }
        });

        // Apply some friction to prevent infinite acceleration
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
  }, [bubbles.length]);

  return {
    bubbles,
    addBubble,
    addReaction
  };
};