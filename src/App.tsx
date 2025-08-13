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

  console.log('App render - user:', user?.name || 'null', 'isAuthenticated:', isAuthenticated, 'user object:', user);

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
    console.log('User is null, showing loading...');
    return <div>Loading...</div>;
  }
  
  console.log('Rendering main app interface for:', user.name);
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BubbleField user={user} onAddBubble={handleAddBubble} />
      <ProfileButton />
      <ChatBar onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App;