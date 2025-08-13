export interface User {
  id: string;
  name: string;
  avatar: string;
  aura: number;
  isOnline: boolean;
}

export interface Bubble {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  x: number;
  y: number;
  vx: number;
  vy: number;
  reactions: number;
  user: User;
}

export interface DirectMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: User[];
  messages: DirectMessage[];
  lastMessage?: DirectMessage;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (provider: 'google' | 'instagram') => void;
  loginAsGuest: () => void;
  logout: () => void;
}