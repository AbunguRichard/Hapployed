import React, { useState } from 'react';
import { Zap, MapPin, Mic, Loader2, CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function TapForHelpButton({ user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [helpers, setHelpers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState('');

  // Text-to-Speech
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech Recognition
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      speak("I'm listening, tell me what you need");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoicePrompt(transcript);
      setIsListening(false);
      handleTapForHelp(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Could not understand. Please try again');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleTapForHelp = async (voice = null) => {
    setIsLoading(true);
    
    try {
      // Get user location (mock for now)
      const location = user?.location || 'nearby';
      
      const response = await fetch(`${BACKEND_URL}/api/sos/tap-help`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || 'test-user',
          location: location,
          recentSearch: '',
          voicePrompt: voice || 'need help now'
        })
      });

      const data = await response.json();
      
      setHelpers(data.nearbyHelpers);
      setShowResults(true);
      
      // Speak the results
      speak(data.narration);
      
      toast.success(`Found ${data.nearbyHelpers.length} helpers nearby!`);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not find help. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Giant SOS Button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => handleTapForHelp()}
          disabled={isLoading || isListening}
          className="relative w-64 h-64 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-16 h-16 animate-spin mb-3" />
              <p className="text-2xl font-bold">Finding Help...</p>
            </div>
          ) : isListening ? (
            <div className="flex flex-col items-center justify-center">
              <Mic className="w-16 h-16 animate-pulse mb-3" />
              <p className="text-2xl font-bold">Listening...</p>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping" />
              <div className="relative flex flex-col items-center justify-center">
                <Zap className="w-20 h-20 mb-3" />
                <p className="text-3xl font-bold">Need Help?</p>
                <p className="text-xl">Tap Here</p>
              </div>
            </>
          )}
        </button>

        {/* Voice Input Button */}
        <button
          onClick={startVoiceInput}
          disabled={isLoading || isListening}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Mic className="w-5 h-5" />
          {isListening ? 'Listening...' : 'Use Voice Instead'}
        </button>

        {voicePrompt && (
          <div className="text-center text-sm text-muted-foreground">
            You said: "{voicePrompt}"
          </div>
        )}
      </div>

      {/* Results */}
      {showResults && helpers.length > 0 && (
        <div className="mt-8 space-y-4 animate-fade-in">
          <h3 className="text-2xl font-bold text-foreground text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Help is on the way!
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {helpers.map((helper) => (
              <div
                key={helper.id}
                className="p-6 border-2 border-border rounded-2xl hover:border-primary hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={helper.avatar}
                    alt={helper.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground">{helper.name}</h4>
                      {helper.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{helper.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-500 font-semibold">
                    <MapPin className="w-4 h-4" />
                    {helper.distance}
                  </div>
                  <p className="text-muted-foreground">{helper.service}</p>
                  <p className="text-foreground font-semibold">{helper.price}</p>
                </div>

                <button className="w-full mt-4 btn-primary">
                  Contact Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
