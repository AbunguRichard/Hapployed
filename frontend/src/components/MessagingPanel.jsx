import React, { useState } from 'react';
import { X, Search, Send, Paperclip, MoreVertical, Phone, Video, User, CheckCircle2 } from 'lucide-react';

export default function MessagingPanel({ onClose }) {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  const chats = [
    {
      id: 1,
      name: 'John Smith',
      avatar: 'JS',
      lastMessage: 'Thanks for your interest!',
      time: '2m ago',
      unread: 2,
      gigTitle: 'Emergency Gig',
      status: 'active',
    },
    {
      id: 2,
      name: 'Restaurant LLC',
      avatar: 'RL',
      lastMessage: 'When can you start?',
      time: '1h ago',
      unread: 0,
      gigTitle: 'Delivery Driver',
      status: 'pending',
    },
    {
      id: 3,
      name: 'Tech Startup',
      avatar: 'TS',
      lastMessage: 'Your proposal looks great',
      time: '3h ago',
      unread: 1,
      gigTitle: 'React Developer',
      status: 'accepted',
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'them',
      text: 'Hi! I saw your profile and I think you\'d be perfect for this gig.',
      time: '10:30 AM',
    },
    {
      id: 2,
      sender: 'me',
      text: 'Thanks! I\'m very interested. What are the exact requirements?',
      time: '10:35 AM',
    },
    {
      id: 3,
      sender: 'them',
      text: 'Thanks for your interest! We need someone who can start immediately and has experience with emergency repairs.',
      time: '10:40 AM',
    },
    {
      id: 4,
      sender: 'me',
      text: 'I can start right away. I have 5 years of experience in emergency plumbing.',
      time: '10:42 AM',
    },
  ];

  const currentChat = chats.find(c => c.id === selectedChat);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
        {/* Left Panel - Chat List */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Messages</h2>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-muted transition-colors border-b border-border ${
                  selectedChat === chat.id ? 'bg-primary/5' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">{chat.avatar}</span>
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground">{chat.name}</span>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-1">{chat.lastMessage}</p>
                  <span className="text-xs text-primary">{chat.gigTitle}</span>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center flex-shrink-0">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel - Conversation */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-semibold">{currentChat.avatar}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">{currentChat.name}</h3>
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md ${
                  msg.sender === 'me' 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-foreground'
                } rounded-2xl px-4 py-3`}>
                  <p>{msg.text}</p>
                  <span className={`text-xs mt-1 block ${
                    msg.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </button>
              <input 
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Context */}
        <div className="w-80 border-l border-border p-6 overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">Gig Details</h3>
          
          <div className="card bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
            <h4 className="font-bold mb-2">{currentChat.gigTitle}</h4>
            <p className="text-sm text-muted-foreground mb-3">Emergency plumbing repair needed</p>
            <span className={`badge ${
              currentChat.status === 'accepted' ? 'badge-green' :
              currentChat.status === 'pending' ? 'badge-purple' :
              'bg-muted text-foreground'
            }`}>
              {currentChat.status === 'accepted' ? 'Accepted' :
               currentChat.status === 'pending' ? 'Pending' :
               'Active'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Pay</h4>
              <p className="text-lg font-bold text-primary">$50/hour</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Duration</h4>
              <p>2-3 hours</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Location</h4>
              <p>0.0 mi away</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button className="w-full btn-primary">View Full Proposal</button>
            <button className="w-full btn-secondary">Schedule Call</button>
          </div>
        </div>
      </div>
    </div>
  );
}