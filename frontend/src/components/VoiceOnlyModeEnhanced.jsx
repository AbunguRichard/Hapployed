import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, MessageSquare, Globe, ChevronDown, Send, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
];

export default function VoiceOnlyMode({ user, onClose }) {
  // Mode toggle
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // Language states
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [preferredLanguage, setPreferredLanguage] = useState(() => {
    return localStorage.getItem('hapployed_preferred_language') || 'en';
  });
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isFirstUse, setIsFirstUse] = useState(() => {
    return !localStorage.getItem('hapployed_language_set');
  });
  
  // Smart suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleVoiceInput(text);
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

  const handleVoiceInput = async (voiceText) => {
    await processCommand(voiceText);
  };

  const handleTextSubmit = async (e) => {
    e?.preventDefault();
    if (!textInput.trim()) return;
    
    setTranscript(textInput);
    setSuggestions([]);
    setShowSuggestions(false);
    await processCommand(textInput);
    setTextInput('');
  };

  const processCommand = async (commandText) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/sos/voice-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || 'test-user',
          voiceText: commandText,
          preferredLanguage: preferredLanguage,
          inputLanguage: detectedLanguage
        })
      });

      const data = await response.json();
      
      // Handle first-time language detection
      if (isFirstUse && data.detectedLanguage) {
        setDetectedLanguage(data.detectedLanguage);
        const langName = SUPPORTED_LANGUAGES.find(l => l.code === data.detectedLanguage)?.name || 'English';
        toast.success(`Language detected: ${langName} ✅`, {
          description: 'You can change this anytime by clicking the 🌐 icon',
          duration: 5000
        });
        localStorage.setItem('hapployed_language_set', 'true');
        localStorage.setItem('hapployed_preferred_language', data.detectedLanguage);
        setPreferredLanguage(data.detectedLanguage);
        setIsFirstUse(false);
      }
      
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

  // Smart suggestions with debounce
  const fetchSuggestions = async (partialText) => {
    if (partialText.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/sos/smart-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partialText: partialText,
          context: 'service_search'
        })
      });

      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleTextInputChange = (e) => {
    const value = e.target.value;
    setTextInput(value);

    // Debounce suggestions
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const selectSuggestion = (suggestion) => {
    setTextInput(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const changeLanguage = (langCode) => {
    setPreferredLanguage(langCode);
    localStorage.setItem('hapployed_preferred_language', langCode);
    const langName = SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name;
    toast.success(`Language changed to ${langName}`);
    setShowLanguageSelector(false);
  };

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === preferredLanguage);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Voice Interface Card */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Textured Background */}
        <div className="absolute inset-0 bg-gray-100" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative border-2 border-white rounded-2xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.8)]">
          {/* Header with Language Selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
                <Volume2 className="w-8 h-8 text-primary" />
                Voice-Only Mode
              </h2>
              <p className="text-muted-foreground">Talk to Hapployed like a person</p>
            </div>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-lg">{currentLang?.flag}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showLanguageSelector && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border-2 border-border z-50 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-sm font-semibold text-muted-foreground px-3 py-2">Select Language</p>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-3 ${
                          preferredLanguage === lang.code ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        {preferredLanguage === lang.code && (
                          <span className="ml-auto text-primary">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setInputMode('voice')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                inputMode === 'voice'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Mic className="w-5 h-5" />
              Voice
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                inputMode === 'text'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Text
            </button>
          </div>

          {/* Voice Input Mode */}
          {inputMode === 'voice' && (
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
          )}

          {/* Text Input Mode */}
          {inputMode === 'text' && (
            <div className="space-y-4">
              <form onSubmit={handleTextSubmit} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={textInput}
                    onChange={handleTextInputChange}
                    placeholder="Type your request... (e.g., Find me a plumber)"
                    className="w-full px-4 py-4 pr-12 rounded-xl border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !textInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Smart Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-border z-50 overflow-hidden">
                    <div className="p-2">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary">
                        <Lightbulb className="w-4 h-4" />
                        Smart Suggestions
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => selectSuggestion(suggestion)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

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
            <p className="font-semibold text-foreground mb-3">Try saying or typing:</p>
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
