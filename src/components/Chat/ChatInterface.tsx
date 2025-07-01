import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageCircle, Phone, Video, MoreVertical } from 'lucide-react';
import { ChatMessage, User as UserType } from '../../types';
import { getUser, getAllUsers, isDoctorRole } from '../../utils/auth';
import { getChatMessagesBetweenUsers, saveChatMessage } from '../../utils/storage';

interface ChatInterfaceProps {
  selectedUserId?: string;
  onSelectUser: (userId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedUserId, onSelectUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = getUser();
  const isDoctor = isDoctorRole();

  useEffect(() => {
    // Load users (students for doctor, doctor for students)
    const allUsers = getAllUsers();
    if (isDoctor) {
      setUsers(allUsers.filter(user => user.role === 'student'));
    } else {
      setUsers(allUsers.filter(user => user.role === 'doctor'));
    }
  }, [isDoctor]);

  useEffect(() => {
    if (selectedUserId && currentUser) {
      const chatMessages = getChatMessagesBetweenUsers(currentUser.id, selectedUserId);
      setMessages(chatMessages);
    }
  }, [selectedUserId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUserId || !currentUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedUserId,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    saveChatMessage(message);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedUser = users.find(user => user.id === selectedUserId);

  return (
    <div className="flex h-[600px] bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
      {/* User List */}
      <div className="w-1/3 border-r border-white/20 flex flex-col">
        <div className="p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>{isDoctor ? 'Students' : 'Doctor'}</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className="p-4 text-center text-white/60">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No {isDoctor ? 'students' : 'doctors'} available</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {users.map((user) => (
                <motion.button
                  key={user.id}
                  onClick={() => onSelectUser(user.id)}
                  className={`w-full p-3 text-left rounded-lg transition-all ${selectedUserId === user.id
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'hover:bg-white/10'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{user.name}</div>
                      <div className="text-white/60 text-sm truncate capitalize">{user.role}</div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{selectedUser.name}</div>
                  <div className="text-white/60 text-sm flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="h-5 w-5" />
                </motion.button>
                <motion.button
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Video className="h-5 w-5" />
                </motion.button>
                <motion.button
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MoreVertical className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => {
                  const isOwn = message.senderId === currentUser?.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${isOwn
                            ? 'bg-gradient-to-r from-gray-700 to-black text-white'
                            : 'bg-white/20 text-white'
                          }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-black text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/60">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Select a conversation</p>
              <p className="text-sm">Choose a {isDoctor ? 'student' : 'doctor'} to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;