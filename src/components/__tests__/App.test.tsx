import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';
import * as useAuthModule from '../../hooks/useAuth';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: mockUseAuth
}));

describe('App', () => {
  it('should show LoginScreen when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      loginAsGuest: vi.fn(),
      logout: vi.fn()
    });

    render(<App />);
    
    expect(screen.getByText('Bubble Messenger')).toBeInTheDocument();
    expect(screen.getByText('Continue as Guest')).toBeInTheDocument();
  });

  it('should show main app when authenticated', () => {
    const mockUser = {
      id: 'guest_123',
      name: 'TestGuest',
      avatar: 'https://example.com/avatar.jpg',
      aura: 50,
      isOnline: true
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: vi.fn(),
      loginAsGuest: vi.fn(),
      logout: vi.fn()
    });

    render(<App />);
    
    // Should not show login screen
    expect(screen.queryByText('Bubble Messenger')).not.toBeInTheDocument();
    
    // Should show main app elements (we can't test for bubbles directly, but we can test for the chat bar)
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });

  it('should call loginAsGuest when Continue as Guest is clicked', () => {
    const mockLoginAsGuest = vi.fn();
    
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      loginAsGuest: mockLoginAsGuest,
      logout: vi.fn()
    });

    render(<App />);
    
    const guestButton = screen.getByText('Continue as Guest');
    fireEvent.click(guestButton);
    
    expect(mockLoginAsGuest).toHaveBeenCalledTimes(1);
  });
});