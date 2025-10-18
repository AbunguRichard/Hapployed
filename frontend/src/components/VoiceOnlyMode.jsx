import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function VoiceOnlyMode({ user }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Could not understand. Please try again');
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (!recognition) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    setIsListening(true);
    setTranscript('');
    setAiResponse('');
    speak("I'm listening");
    recognition.start();
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const processVoiceCommand = async (voiceText) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/sos/voice-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || 'test-user',
          voiceText: voiceText
        })
      });

      const data = await response.json();
      
      setAiResponse(data.confirmation);
      speak(data.confirmation);
      
      // Handle different actions
      if (data.action === 'search' && data.helpers) {
        toast.success(`Found ${data.helpers.length} ${data.service}s nearby!`);
      } else if (data.action === 'post_job') {
        toast.success('Job posting created!');
      }
      
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = 'Sorry, I could not process that command.';
      setAiResponse(errorMsg);
      speak(errorMsg);
      toast.error('Error processing command');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Voice Interface Card */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Textured Background */}
        <div className="absolute inset-0 bg-gray-100" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative border-2 border-white rounded-2xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.8)]">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
              <Volume2 className="w-8 h-8 text-primary" />
              Voice-Only Mode
            </h2>
            <p className="text-muted-foreground">Talk to Hapployed like a person</p>
          </div>

          {/* Microphone Visualization */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`relative w-40 h-40 rounded-full transition-all duration-300 ${
                isListening 
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse scale-110' 
                  : 'bg-gradient-to-br from-primary to-accent hover:scale-105'
              } text-white shadow-2xl disabled:opacity-50`}
            >
              {isProcessing ? (
                <Loader2 className="w-16 h-16 animate-spin mx-auto" />
              ) : isListening ? (
                <>
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                  <Mic className="w-16 h-16 mx-auto relative z-10" />
                </>
              ) : (
                <MicOff className="w-16 h-16 mx-auto" />
              )}
            </button>

            <p className="text-lg font-semibold text-center">
              {isProcessing ? 'Processing...' :
               isListening ? 'Listening... Speak now' :
               'Tap the microphone to start'}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600 font-semibold mb-1">You said:</p>
              <p className="text-foreground">{transcript}</p>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 font-semibold mb-1 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Hapployed says:
              </p>
              <p className="text-foreground">{aiResponse}</p>
            </div>
          )}

          {/* Example Commands */}
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <p className="font-semibold text-foreground mb-3">Try saying:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• "Find me someone to fix my door"</li>
              <li>• "I need a plumber urgently"</li>
              <li>• "Post a job for cleaning tomorrow"</li>
              <li>• "Show me electricians near me"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
