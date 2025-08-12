import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ChatConversation, DirectMessage as DirectMessageType } from '../types';
import { useAuth } from '../hooks/useAuth';

interface DirectMessageProps {
  conversation: ChatConversation;
  onClose: () => void;
}

export const DirectMessage: React.FC<DirectMessageProps> = ({
  conversation,
  onClose
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessageType[]>(conversation.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const otherUser = conversation.participants[0];

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${otherUser.id}),and(from_user_id.eq.${otherUser.id},to_user_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    const formattedMessages: DirectMessageType[] = data.map(msg => ({
      id: msg.id,
      fromUserId: msg.from_user_id,
      toUserId: msg.to_user_id,
      message: msg.message,
      timestamp: new Date(msg.created_at),
      read: msg.read
    }));

    setMessages(formattedMessages);
  }, [user, otherUser.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        from_user_id: user.id,
        to_user_id: otherUser.id,
        message: newMessage.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    const newMsg: DirectMessageType = {
      id: data.id,
      fromUserId: data.from_user_id,
      toUserId: data.to_user_id,
      message: data.message,
      timestamp: new Date(data.created_at),
      read: data.read
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('direct_messages')
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'direct_messages',
          filter: `or(and(from_user_id.eq.${user.id},to_user_id.eq.${otherUser.id}),and(from_user_id.eq.${otherUser.id},to_user_id.eq.${user.id}))`
        },
        (payload) => {
          const newMsg: DirectMessageType = {
            id: payload.new.id,
            fromUserId: payload.new.from_user_id,
            toUserId: payload.new.to_user_id,
            message: payload.new.message,
            timestamp: new Date(payload.new.created_at),
            read: payload.new.read
          };

          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUser.id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full h-[600px] overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            
            <img 
              src={otherUser.avatar} 
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold">{otherUser.name}</h3>
              <p className="text-sm text-white/80">
                {otherUser.isOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.fromUserId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.fromUserId === user?.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.fromUserId === user?.id ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};