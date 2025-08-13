import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    // Clear any existing state
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should create a guest user when loginAsGuest is called', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.loginAsGuest();
    });
    
    // Check that user is created
    expect(result.current.user).not.toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
    
    // Check user properties
    const user = result.current.user!;
    expect(user.id).toMatch(/^guest_/);
    expect(user.name).toMatch(/^Guest\d+$/);
    expect(user.avatar).toContain('pexels.com');
    expect(user.aura).toBeGreaterThan(0);
    expect(user.isOnline).toBe(true);
  });

  it('should logout and clear user', () => {
    const { result } = renderHook(() => useAuth());
    
    // First login as guest
    act(() => {
      result.current.loginAsGuest();
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    
    // Then logout
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should not create multiple users on multiple loginAsGuest calls', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.loginAsGuest();
    });
    
    const firstUser = result.current.user;
    
    act(() => {
      result.current.loginAsGuest();
    });
    
    // Should be the same user
    expect(result.current.user).toBe(firstUser);
  });
});