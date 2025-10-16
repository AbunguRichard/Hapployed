import React from 'react';
import { Zap } from 'lucide-react';

export default function InfoSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Hapployed is Alive.
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          This isn't a static board; it's a living network. When you're in a pinch,
          tap in. We're already there, and we've got your back.
        </p>
        <button className="btn-primary inline-flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Activate Emergency Response
        </button>
      </div>
    </section>
  );
}