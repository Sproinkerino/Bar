import React from 'react';
import { X, MessageCircle, Heart, Clock } from 'lucide-react';
import { Bubble } from '../types';

interface BubbleModalProps {
  bubble: Bubble;
  onClose: () => void;
  onStartChat: (bubble: Bubble) => void;
  onReaction: (bubbleId: string) => void;
}

export const BubbleModal: React.FC<BubbleModalProps> = ({
  bubble,
  onClose,
  onStartChat,
  onReaction
}) => {
  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={bubble.user.avatar} 
                alt={bubble.user.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
              />
              {bubble.user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{bubble.user.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Heart size={14} className="text-purple-500" />
                  {bubble.user.aura} aura
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {timeAgo(bubble.timestamp)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Message Content */}
        <div className="p-6">
          <p className="text-gray-800 text-lg leading-relaxed mb-6">
            {bubble.message}
          </p>
          
          {/* Reactions Display */}
          {bubble.reactions > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                <Heart size={16} className="fill-current" />
                {bubble.reactions} reactions
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={() => onStartChat(bubble)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Message
          </button>
          
          <button
            onClick={() => onReaction(bubble.id)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <Heart size={18} />
            +1 aura
          </button>
        </div>
      </div>
    </div>
  );
};