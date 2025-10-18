import React from 'react';
import { X } from 'lucide-react';
import VoiceOnlyMode from './VoiceOnlyMode';

export default function VoiceOnlyModeModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>
        
        {/* Voice Mode Component */}
        <VoiceOnlyMode user={user} onClose={onClose} />
      </div>
    </div>
  );
}
