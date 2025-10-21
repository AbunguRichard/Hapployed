import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Square, Sparkles } from 'lucide-react';

export default function VoiceCaptureModal({ isOpen, onClose, onTranscriptComplete, workType }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    }
    
    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
      recognitionRef.current = null;
    }

    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.log('AudioContext already closed');
      }
      audioContextRef.current = null;
    }

    setIsListening(false);
    setTranscript('');
    setAudioLevel(0);
  };

  const startListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser');
      onClose();
      return;
    }

    // Initialize audio visualization
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      visualizeAudio();
    } catch (err) {
      console.error('Microphone access denied:', err);
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
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

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted') {
        setIsListening(false);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average audio level
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(average / 255);
    };

    draw();
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
          ) : (
            <span className="text-sm font-semibold text-gray-600">Processing your request...</span>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Your request:</p>
            <p className="text-gray-900">{transcript}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4">
          {isListening ? (
            <button
              onClick={handleStopAndReview}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>Stop & Review</span>
            </button>
          ) : transcript ? (
            <button
              onClick={handleStopAndReview}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Form</span>
            </button>
          ) : (
            <button
              onClick={startListening}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all"
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
