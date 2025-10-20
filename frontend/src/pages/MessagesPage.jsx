import React, { useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import { MessageSquare, Send, Search, MoreVertical, Paperclip, Smile } from 'lucide-react';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversations data
  const conversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'Thanks! I will review the proposal and get back to you.',
      timestamp: '2 min ago',
      unread: 2,
      online: true,
      role: 'Client'
    },
    {
      id: 2,
      name: 'TechCorp Inc.',
      avatar: 'TC',
      lastMessage: 'When can you start the project?',
      timestamp: '1 hour ago',
      unread: 0,
      online: false,
      role: 'Client'
    },
    {
      id: 3,
      name: 'Mike Chen',
      avatar: 'MC',
      lastMessage: 'Perfect! The design looks great.',
      timestamp: '3 hours ago',
      unread: 0,
      online: true,
      role: 'Worker'
    },
    {
      id: 4,
      name: 'Digital Solutions Ltd',
      avatar: 'DS',
      lastMessage: 'We have an urgent project that matches your skills',
      timestamp: 'Yesterday',
      unread: 1,
      online: false,
      role: 'Client'
    }
  ];

  // Mock messages for selected conversation
  const messages = [
    {
      id: 1,
      sender: 'them',
      text: 'Hi! I saw your profile and I think you would be perfect for our project.',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Thank you! I would love to hear more about it.',
      timestamp: '10:32 AM'
    },
    {
      id: 3,
      sender: 'them',
      text: 'We need a full-stack developer to build an e-commerce platform. Are you available?',
      timestamp: '10:35 AM'
    },
    {
      id: 4,
      sender: 'me',
      text: 'Yes, I am available. Could you share more details about the timeline and requirements?',
      timestamp: '10:40 AM'
    },
    {
      id: 5,
      sender: 'them',
      text: 'Thanks! I will review the proposal and get back to you.',
      timestamp: '11:15 AM'
    }
  ];

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      // TODO: Implement send message logic
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-pink-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search Header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedConversation === conversation.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full ${getAvatarColor(conversation.name)} flex items-center justify-center text-white font-semibold`}>
                        {conversation.avatar}
                      </div>
                      {conversation.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conversation.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        {conversation.unread > 0 && (
                          <span className="ml-2 flex-shrink-0 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">{conversation.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${getAvatarColor(currentConversation.name)} flex items-center justify-center text-white font-semibold`}>
                        {currentConversation.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{currentConversation.name}</h3>
                        <p className="text-xs text-gray-500">
                          {currentConversation.online ? 'Active now' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                message.sender === 'me'
                                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 px-1">{message.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="flex-1 relative">
                        <textarea
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type your message..."
                          rows="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Smile className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
