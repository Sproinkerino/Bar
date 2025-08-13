import React, { useState, useCallback, useEffect } from 'react';
import { BubbleField } from './components/BubbleField';
import { ChatBar } from './components/ChatBar';
import { ProfileButton } from './components/ProfileButton';
import { LoginScreen } from './components/LoginScreen';
import { useAuth } from './hooks/useAuth';
import { User } from './types';

function App() {
  const { user, isAuthenticated } = useAuth();
  const [addBubbleFn, setAddBubbleFn] = useState<((message: string, user: User) => void) | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('App render - isAuthenticated:', isAuthenticated, 'user:', user?.name || 'null');
  }, [isAuthenticated, user]);

  const handleAddBubble = useCallback((addBubbleFn: (message: string, user: User) => void) => {
    setAddBubbleFn(() => addBubbleFn);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    if (addBubbleFn && user) {
      addBubbleFn(message, user);
    }
  }, [addBubbleFn, user]);

  // Show login screen if not authenticated
  if (!isAuthenticated || !user) {
    console.log('Showing login screen');
    return <LoginScreen />;
  }

  console.log('Showing main app with bubbles');
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BubbleField user={user} onAddBubble={handleAddBubble} />
      <ProfileButton />
      <ChatBar onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App;