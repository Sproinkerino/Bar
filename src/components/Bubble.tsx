import React from 'react';
import { Bubble as BubbleType } from '../types';

interface BubbleProps {
  bubble: BubbleType;
  onClick: (bubble: BubbleType) => void;
}

export const Bubble: React.FC<BubbleProps> = ({ bubble, onClick }) => {
  return (
    <div
      className="absolute cursor-pointer transform transition-transform duration-200 hover:scale-105 active:scale-95 bubble-container"
      style={{
        left: bubble.x,
        top: bubble.y,
        zIndex: 30
      }}
      onClick={() => onClick(bubble)}
    >
      <div className="flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-2">
          <img 
            src={bubble.user.avatar} 
            alt={bubble.user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
          />
          {bubble.user.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border border-white" />
          )}
        </div>
        
        {/* Message bubble */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-1 py-1 shadow-lg border border-purple-200 max-w-[140px] min-w-[80px]">
          <p className="text-sm text-gray-800 font-medium text-center line-clamp-3">
            {bubble.message}
          </p>
        </div>
      </div>
    </div>
  );
};