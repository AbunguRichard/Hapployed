import React from 'react';
import { X, ArrowRight } from 'lucide-react';

/**
 * ModeSwitchInterstitial - Prompt shown when user attempts action in wrong mode
 * Example: "Switch to Talent to continue applying?"
 */
export default function ModeSwitchInterstitial({ 
  isOpen, 
  onClose, 
  onConfirm, 
  targetMode,
  actionType,
  actionDescription 
}) {
  if (!isOpen) return null;

  const modeDisplay = targetMode === 'worker' ? 'Talent' : 'Employer';
  
  const getTitle = () => {
    if (actionType === 'APPLY') return `Switch to ${modeDisplay} to continue?`;
    if (actionType === 'POST_JOB') return `Switch to ${modeDisplay} to continue?`;
    if (actionType === 'HIRE') return `Switch to ${modeDisplay} to continue?`;
    return `Switch to ${modeDisplay}?`;
  };

  const getBody = () => {
    if (actionType === 'APPLY') {
      return `You're about to apply using your ${modeDisplay} Profile. Your application will be submitted after switching.`;
    }
    if (actionType === 'POST_JOB') {
      return `You're about to post a job using your ${modeDisplay} account. Your job posting will be created after switching.`;
    }
    if (actionType === 'HIRE') {
      return `You need ${modeDisplay} mode to hire workers. You'll be redirected to continue.`;
    }
    return actionDescription || `This action requires ${modeDisplay} mode.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {getTitle()}
          </h3>
          <p className="text-gray-600">
            {getBody()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            Switch & Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
