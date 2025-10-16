import React from 'react';
import { 
  MapPin, Clock, DollarSign, Heart, MessageSquare, Share2, 
  AlertTriangle, CheckCircle2, Star, Zap, Award, Users
} from 'lucide-react';

export default function GigCard({ gig, onSave, onApply, isSaved, showMatchScore }) {
  return (
    <div className="card hover-lift group bg-white">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {gig.title}
                </h3>
                {gig.urgent && (
                  <span className="badge badge-purple animate-pulse flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    URGENT
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 text-accent font-semibold">
                  <MapPin className="w-4 h-4" />
                  {gig.distance}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {gig.startTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {gig.applicants} applicants
                </span>
              </div>
            </div>

            {showMatchScore && gig.matchScore && (
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-lg">
                  <Award className="w-4 h-4" />
                  <span className="font-bold">{gig.matchScore}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">Match</p>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-foreground mb-3">{gig.description}</p>

          {/* Tags & Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge badge-purple">{gig.category}</span>
            {gig.skills.map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-muted text-foreground text-xs rounded">
                {skill}
              </span>
            ))}
            {gig.clientVerified && (
              <span className="badge badge-green flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Client Verified
              </span>
            )}
            {gig.backgroundCheck && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Background Check
              </span>
            )}
          </div>

          {/* Client Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-semibold">{gig.client.name[0]}</span>
            </div>
            <span>{gig.client.name}</span>
            {gig.client.verified && (
              <CheckCircle2 className="w-4 h-4 text-accent" />
            )}
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning fill-warning" />
              {gig.client.rating}
            </span>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col justify-between items-end md:w-48 gap-3">
          {/* Pay & Duration */}
          <div className="text-right">
            <div className="text-2xl font-bold text-primary mb-1">{gig.pay}</div>
            <div className="text-sm text-muted-foreground">{gig.duration}</div>
            <div className="text-sm text-destructive font-semibold mt-1">{gig.timeLeft}</div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full">
            {gig.urgent ? (
              <button 
                onClick={() => onApply(gig.id, true)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Quick Apply
              </button>
            ) : (
              <button 
                onClick={() => onApply(gig.id, false)}
                className="w-full btn-primary"
              >
                Apply Now
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onSave(gig.id)}
                className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                  isSaved 
                    ? 'bg-accent/10 border-accent text-accent' 
                    : 'border-border text-muted-foreground hover:border-accent hover:text-accent'
                }`}
              >
                <Heart className={`w-4 h-4 mx-auto ${isSaved ? 'fill-accent' : ''}`} />
              </button>
              <button className="flex-1 px-3 py-2 border border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-all">
                <MessageSquare className="w-4 h-4 mx-auto" />
              </button>
              <button className="flex-1 px-3 py-2 border border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-all">
                <Share2 className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}