import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Square, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceCaptureModal({ isOpen, onClose, onTranscriptComplete, workType }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  // Initialize Speech Recognition (same as Homepage)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          toast.error('Could not understand. Please try again');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Already stopped
        }
      }
    };
  }, [recognition]);

  const startListening = () => {
    if (!recognition) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    setIsListening(true);
    setTranscript('');
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleStopAndReview = () => {
    cleanup();
    
    if (transcript.trim()) {
      onTranscriptComplete(transcript, workType);
    }
    
    onClose();
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slideUp">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Voice-Only Mode</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {workType === 'project' ? 'Describe Your Project' : 'Describe Your Gig'}
          </h2>
          <p className="text-sm text-gray-600">
            Speak naturally. AI will understand and fill your form.
          </p>
        </div>

        {/* Audio Visualization */}
        <div className="relative mb-6">
          <div className="flex items-center justify-center gap-1 h-20">
            {[...Array(15)].map((_, i) => {
              const height = isListening 
                ? Math.max(12, Math.random() * audioLevel * 60 + 12) 
                : 12;
              
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isListening ? 'bg-gradient-to-t from-purple-500 to-pink-500' : 'bg-gray-300'
                  }`}
                  style={{
                    height: `${height}px`,
                    animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none',
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-4">
          {isListening ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-900">Listening... Speak now</span>
              </div>
              <p className="text-xs text-gray-500">
                e.g., "I need a plumber tomorrow at 5 PM"
              </p>
            </>
          ) : transcript ? (
            <span className="text-sm font-semibold text-green-600">✓ Recording complete</span>
          ) : (
            <span className="text-sm font-semibold text-gray-600">Click "Start Recording" to begin</span>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Your request:</p>
            <p className="text-sm text-gray-900">{transcript}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {isListening ? (
            <button
              onClick={handleStopAndReview}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop & Review</span>
            </button>
          ) : transcript ? (
            <button
              onClick={handleStopAndReview}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Form</span>
            </button>
          ) : (
            <button
              onClick={startListening}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
