import React, { useState, useCallback } from 'react';
import { BubbleField } from './components/BubbleField';
import { ChatBar } from './components/ChatBar';
import { ProfileButton } from './components/ProfileButton';
import { LoginScreen } from './components/LoginScreen';
import { useAuth } from './hooks/useAuth';
import { User } from './types';

function App() {
  const { user, isAuthenticated } = useAuth();
  const [addBubbleFn, setAddBubbleFn] = useState<((message: string, user: User) => void) | null>(null);

  console.log('App render - user:', user?.name || 'null', 'isAuthenticated:', isAuthenticated);

  const handleAddBubble = useCallback((addBubbleFn: (message: string, user: User) => void) => {
    setAddBubbleFn(() => addBubbleFn);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    if (addBubbleFn && user) {
      addBubbleFn(message, user);
    }
  }, [addBubbleFn, user]);

  if (!isAuthenticated) {
    console.log('Showing login screen - user is:', user?.name || 'null');
    return <LoginScreen />;
  }

  console.log('Showing main app for user:', user?.name);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BubbleField user={user} onAddBubble={handleAddBubble} />
      <ProfileButton />
      <ChatBar onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App;