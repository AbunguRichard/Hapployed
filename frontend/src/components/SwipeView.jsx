import React, { useState } from 'react';
import { Heart, X, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SwipeView({ gigs, onSave, onApply, savedGigs }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);

  const currentGig = gigs[currentIndex];

  const handleSwipe = (swipeDirection) => {
    setDirection(swipeDirection);
    
    setTimeout(() => {
      if (swipeDirection === 'right') {
        onSave(currentGig.id);
        toast.success('Gig saved to your list!');
      } else if (swipeDirection === 'left') {
        toast('Gig hidden', { description: 'Undo available for 5 seconds' });
      } else if (swipeDirection === 'up') {
        onApply(currentGig.id, true);
        toast.success('Quick Apply sent!');
      }
      
      if (currentIndex < gigs.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast('No more gigs nearby', { description: 'Try adjusting your filters' });
      }
      setDirection(null);
    }, 300);
  };

  if (!currentGig) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No more gigs</h3>
        <p className="text-muted-foreground">Try adjusting your filters to see more opportunities</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Gig {currentIndex + 1} of {gigs.length}</span>
        <span>{gigs.length - currentIndex - 1} remaining</span>
      </div>

      {/* Card Deck */}
      <div className="relative h-[600px]">
        <div 
          className={`absolute inset-0 card bg-white transition-transform duration-300 ${
            direction === 'left' ? '-translate-x-full rotate-[-10deg]' :
            direction === 'right' ? 'translate-x-full rotate-[10deg]' :
            direction === 'up' ? '-translate-y-full scale-95' :
            ''
          }`}
        >
          {/* Card Content */}
          <div className="h-full flex flex-col">
            {/* Image/Header */}
            <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-xl flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">{currentGig.title}</h2>
                <div className="text-xl font-bold text-primary">{currentGig.pay}</div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-semibold text-accent">{currentGig.distance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start Time</span>
                  <span className="font-semibold">{currentGig.startTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold">{currentGig.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Left</span>
                  <span className="font-semibold text-destructive">{currentGig.timeLeft}</span>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{currentGig.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Skills Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentGig.skills.map((skill, idx) => (
                      <span key={idx} className="badge badge-purple">{skill}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Client</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-semibold">{currentGig.client.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{currentGig.client.name}</p>
                      <p className="text-sm text-muted-foreground">Rating: {currentGig.client.rating} ⭐</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Controls */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-muted hover:bg-destructive/10 border-2 border-border hover:border-destructive flex items-center justify-center transition-all"
        >
          <X className="w-8 h-8 text-destructive" />
        </button>
        
        <button 
          onClick={() => handleSwipe('up')}
          className="w-20 h-20 rounded-full bg-primary hover:bg-primary-dark flex items-center justify-center transition-all shadow-lg"
        >
          <ArrowUp className="w-10 h-10 text-white" />
        </button>
        
        <button 
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-muted hover:bg-accent/10 border-2 border-border hover:border-accent flex items-center justify-center transition-all"
        >
          <Heart className="w-8 h-8 text-accent" />
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p><X className="w-4 h-4 inline text-destructive" /> Swipe left to pass</p>
        <p><ArrowUp className="w-4 h-4 inline text-primary" /> Swipe up to quick apply</p>
        <p><Heart className="w-4 h-4 inline text-accent" /> Swipe right to save</p>
      </div>
    </div>
  );
}