import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, Search, User, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../components/DashboardHeader';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get('workerId');

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-select conversation if workerId is provided
  useEffect(() => {
    if (workerId && conversations.length > 0) {
      const conv = conversations.find(c => c.participants.includes(workerId));
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [workerId, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const userId = user.id || user.email;
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${conversationId}/messages`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      const userId = user.id || user.email;
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/messages/${conversationId}/mark-read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const userId = user.id || user.email;
      const receiverId = selectedConversation.participants.find(p => p !== userId);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: selectedConversation.id,
            senderId: userId,
            receiverId: receiverId,
            content: newMessage.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      setMessages([...messages, sentMessage]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    return conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-white">Messages</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Left Sidebar - Conversations List */}
          <div className="lg:col-span-1 bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageCircle className="w-16 h-16 text-cyan-500 mb-4" />
                  <h3 className="text-white text-lg font-bold mb-2">No conversations yet</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Conversations will appear here when you:
                  </p>
                  <ul className="text-gray-400 text-sm text-left space-y-2 mb-6">
                    <li>✓ Apply to a job</li>
                    <li>✓ Accept a worker's application</li>
                    <li>✓ Hire someone for a QuickHire gig</li>
                  </ul>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/opportunities')}
                      className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Browse Jobs
                    </button>
                    <button
                      onClick={() => navigate('/find-workers')}
                      className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Find Workers
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedConversation?.id === conv.id
                          ? 'bg-cyan-500/20 border-l-4 border-cyan-500'
                          : 'hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white font-semibold truncate">
                              Conversation
                            </h3>
                            {conv.lastMessage && (
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                {formatTime(conv.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          {conv.lastMessage ? (
                            <p className="text-sm text-gray-400 truncate">
                              {conv.lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No messages yet</p>
                          )}
                          {conv.unreadCount > 0 && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500 text-white text-xs font-bold rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Message Thread */}
          <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Conversation</h2>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">No messages yet</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Start the conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === (user.id || user.email);
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              isOwn
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                : 'bg-slate-700 text-gray-100'
                            }`}
                          >
                            <p className="break-words">{msg.content}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 opacity-70" />
                              <span className="text-xs opacity-70">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-400">
                    Choose a conversation from the left to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
