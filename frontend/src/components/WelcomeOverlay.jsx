import React, { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, Briefcase, Users, CheckCircle2 } from 'lucide-react';

export default function WelcomeOverlay({ user, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: `Welcome to Hapployed, ${user?.fullName?.split(' ')[0] || 'there'}!`,
      description: 'You\'re all set! Here\'s a quick tour to help you get started.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: MapPin,
      title: 'Discover Opportunities',
      description: 'Browse thousands of gigs tailored to your skills and location. Our AI matches you with the best opportunities.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      action: 'Browse Now',
    },
    {
      icon: Briefcase,
      title: 'Enhance Your Profile',
      description: 'Add more skills, portfolio links, and work experience to stand out and get better matches.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      action: 'Update Profile',
    },
    {
      icon: Users,
      title: 'Connect & Grow',
      description: 'Join our community of 50k+ workers. Get instant notifications when opportunities match your profile.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      action: 'Get Started',
    },
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  useEffect(() => {
    // Prevent body scroll when overlay is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slide-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl ${currentStepData.bgColor} flex items-center justify-center mb-6`}>
            <Icon className={`w-8 h-8 ${currentStepData.color}`} />
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-lg mb-8">
            {currentStepData.description}
          </p>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-accent'
                    : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors font-semibold"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Get Started
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>

          {/* Step Counter */}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
}