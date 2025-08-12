import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ChatBarProps {
  onSendMessage: (message: string) => void;
}

export const ChatBar: React.FC<ChatBarProps> = ({ onSendMessage }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom">
      <div className="bg-white/95 backdrop-blur-md border-t border-white/20 p-3 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-full mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-purple-600 flex-shrink-0">
              <Sparkles size={20} className="animate-pulse" />
              <span className="text-xs font-medium hidden xs:block">Share</span>
            </div>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What's on your mind?"
                maxLength={280}
                className="w-full px-4 py-3 rounded-full border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-500 bg-white/80 backdrop-blur-sm text-sm"
              />
              <div className="absolute right-3 bottom-1 text-xs text-gray-400">
                {message.length}/280
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-200 transform active:scale-95 disabled:active:scale-100 shadow-lg flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};