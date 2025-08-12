import React from 'react';
import { LogIn, MessageCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animated background bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-16 h-16 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Bubble Messenger
            </h1>
            <p className="text-gray-600 text-lg">
              Share your thoughts as floating bubbles
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-purple-600" />
              </div>
              <span>Express yourself with floating message bubbles</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle size={16} className="text-blue-600" />
              </div>
              <span>Connect with others through meaningful conversations</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <LogIn size={16} className="text-pink-600" />
              </div>
              <span>Join a community of creative minds</span>
            </div>
          </div>

          {/* Login Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => login('google')}
              className="w-full bg-white border-2 border-gray-300 hover:border-purple-400 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-red-500 rounded-full" />
              Demo Login (Google Style)
            </button>
            
            <button
              onClick={() => login('instagram')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
              Demo Login (Instagram Style)
            </button>
          </div>

          {/* Demo Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Demo mode - creates a random user account to explore the app!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};