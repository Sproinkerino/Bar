import React, { useState } from 'react';
import { Bubble } from './Bubble';
import { BubbleModal } from './BubbleModal';
import { DirectMessage } from './DirectMessage';
import { useBubbles } from '../hooks/useBubbles';
import { Bubble as BubbleType, ChatConversation, User } from '../types';

interface BubbleFieldProps {
  user: User | null;
  onAddBubble: (addBubbleFn: (message: string, user: User) => void) => void;
}

export const BubbleField: React.FC<BubbleFieldProps> = ({ user, onAddBubble }) => {
  const { bubbles, addBubble, addReaction } = useBubbles();
  
  const [selectedBubble, setSelectedBubble] = useState<BubbleType | null>(null);
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);

  // Pass addBubble function to parent
  React.useEffect(() => {
    onAddBubble(addBubble);
  }, [addBubble, onAddBubble]);

  const handleBubbleClick = (bubble: BubbleType) => {
    setSelectedBubble(bubble);
  };

  const handleCloseModal = () => {
    setSelectedBubble(null);
  };

  const handleStartChat = (bubble: BubbleType) => {
    const conversation: ChatConversation = {
      id: Date.now().toString(),
      participants: [bubble.user],
      messages: []
    };
    setActiveChat(conversation);
    setSelectedBubble(null);
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  const handleReaction = (bubbleId: string) => {
    addReaction(bubbleId);
  };

  return (
    <>
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100" />
      
      {/* Floating bubbles */}
      <div className="fixed inset-0 overflow-hidden">
        {bubbles.map((bubble) => (
          <Bubble 
            key={bubble.id} 
            bubble={bubble} 
            onClick={handleBubbleClick}
          />
        ))}
      </div>

      {/* Bubble Modal */}
      {selectedBubble && (
        <BubbleModal
          bubble={selectedBubble}
          onClose={handleCloseModal}
          onStartChat={handleStartChat}
          onReaction={handleReaction}
        />
      )}

      {/* Direct Message Interface */}
      {activeChat && (
        <DirectMessage
          conversation={activeChat}
          onClose={handleCloseChat}
        />
      )}
    </>
  );
};