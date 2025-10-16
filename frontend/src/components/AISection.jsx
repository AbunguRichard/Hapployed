import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function AISection() {
  const benefits = [
    'Instant job matching based on your skills and location',
    'Smart recommendations that learn from your preferences',
    'Automatic application submission to relevant gigs',
    'No more endless scrolling or manual searches',
    'Get notified immediately when perfect opportunities arise',
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Smart Matching
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              AI That Reduces the Sweat of Applying
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our intelligent system does the heavy lifting for you. No more filling
              out countless applications or searching through endless job boards.
            </p>

            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <button className="btn-primary">
              Get Started Free
            </button>
          </div>

          {/* Right: AI Graphic */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 p-8 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80"
                alt="AI Technology"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}