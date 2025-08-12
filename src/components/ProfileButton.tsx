import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const ProfileButton: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2 safe-area-inset-top">
      <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-white/20">
        <div className="flex items-center gap-2">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="text-sm hidden xs:block">
            <div className="font-medium text-gray-800">{user.name}</div>
            <div className="text-xs text-purple-600">{user.aura} aura</div>
          </div>
        </div>
      </div>
      <button
        onClick={logout}
        className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg border border-white/20 hover:bg-white/100 active:scale-95 transition-all duration-200"
        title="Logout"
      >
        <LogOut size={16} className="text-gray-600" />
      </button>
    </div>
  );
};