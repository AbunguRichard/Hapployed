import React from 'react';
import { Cpu, Sparkles, Plus } from 'lucide-react';

export default function SkillsSection() {
  const skills = ['mechanique', 'React', 'Node.js', 'Python', 'UI/UX Design'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Your Skill DNA */}
      <div className="glass-strong rounded-2xl p-6 md:p-8 hover-lift neon-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Your Skill DNA</h2>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Primary Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 glass rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-all cursor-pointer neon-border-accent group"
              >
                {skill}
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
              </span>
            ))}
          </div>
        </div>

        <button className="w-full mt-4 px-4 py-3 glass-strong rounded-lg text-sm font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-all border border-primary/30 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add More Skills
        </button>
      </div>

      {/* Oracle Insights */}
      <div className="glass-strong rounded-2xl p-6 md:p-8 hover-lift neon-border-accent relative overflow-hidden">
        {/* Animated pulse effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center glow-accent pulse-glow">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold gradient-text-secondary">Oracle Insights</h2>
          </div>

          <p className="text-muted-foreground text-sm mb-4">
            AI-powered opportunity predictions
          </p>

          <div className="bg-muted/20 rounded-xl p-6 border border-accent/20">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 pulse-glow">
                <Sparkles className="w-8 h-8 text-accent animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                No new predictions yet. Oracle is analyzing opportunities for you...
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}