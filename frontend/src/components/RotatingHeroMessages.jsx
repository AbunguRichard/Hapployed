import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const MESSAGES = [
  "This isn't a platform — it's your backup crew.",
  "When life happens, Hapployed happens.",
  "The world's gigs, one tap away.",
  "From local hustles to global projects — we connect it all.",
  "Find work, find help, find momentum.",
  "AI meets hustle — we match you faster than thought.",
  "You don't look for work — work finds you.",
  "Instant jobs. Real people. Zero stress.",
  "Your neighborhood just became your marketplace.",
  "Earn faster. Hire smarter. Live freer."
];

export default function RotatingHeroMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    } else if (e.key === 'ArrowLeft') {
      setCurrentIndex((prev) => (prev - 1 + MESSAGES.length) % MESSAGES.length);
    } else if (e.key === ' ') {
      e.preventDefault();
      setIsPaused(!isPaused);
    }
  };

  return (
    <section 
      className="relative py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Rotating hero messages"
      aria-live="polite"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Hapployed is Alive
          </h2>

          {/* Rotating Message */}
          <div className="relative min-h-[120px] flex items-center justify-center">
            <p 
              className={`text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-primary transition-all duration-500 ${
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {MESSAGES[currentIndex]}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {MESSAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-12 bg-primary' 
                    : 'w-2 bg-muted hover:bg-primary/50'
                }`}
                aria-label={`Go to message ${index + 1}`}
              />
            ))}
          </div>

          {/* Keyboard hint */}
          <p className="text-sm text-muted-foreground mt-6">
            Use arrow keys to navigate • Space to pause • Hover to pause
          </p>
        </div>
      </div>
    </section>
  );
}
