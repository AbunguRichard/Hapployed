import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Clock, DollarSign, Users, TrendingUp, Filter, MessageCircle, ChevronDown, ChevronUp, Check, Zap, Shield, Target, Briefcase, FileText } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function OpportunitiesPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch opportunities from backend
  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/opportunities`);
      const data = await response.json();
      setOpportunities(data.jobs || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const opportunities = [
    {
      id: 1,
      title: 'Revamp E-commerce Dashboard with React & TypeScript',
      badge: { text: '⭐️ Preferred', type: 'preferred' },
      urgency: 'URGENT HIRE',
      description: 'We need an experienced React developer to rebuild the user dashboard for our e-commerce platform. Must have strong skills in state management (Redux) and TypeScript.',
      budget: { amount: '$2,500', type: 'Fixed' },
      duration: '2-4 weeks',
      hoursPerWeek: '20-30 hrs/week',
      experienceLevel: 'Expert Level',
      client: {
        rating: 4.8,
        reviews: 42,
        totalSpent: '$85k+',
        location: 'United States',
        verified: true,
        responseTime: 'Usually hires within 48 hours',
        companySize: '50-100 people',
        companyType: 'E-commerce company'
      },
      skills: ['TypeScript', 'Redux Toolkit', 'CSS-in-JS', 'Responsive Design'],
      proposals: 15,
      interviewing: 5,
      lastViewed: '2 hours ago',
      matchScore: 95,
      ctaText: 'Apply Now',
      detailedScope: {
        work: [
          'Redesign user dashboard with modern UI',
          'Implement state management with Redux Toolkit',
          'TypeScript migration from existing JavaScript',
          'Collaborate with backend team on API integration'
        ],
        deliverables: ['Responsive dashboard', 'Complete documentation', 'Unit tests'],
        teamSize: 'Work with 1 backend developer'
      }
    },
    {
      id: 2,
      title: 'Urgent: Mobile App UI/UX Design',
      badge: { text: '🔥 Urgent Hire', type: 'urgent' },
      urgency: 'URGENT',
      description: 'Our designer left suddenly. Need someone to take over Figma files and complete the UI for a fitness tracking mobile app. Must be available to start immediately.',
      budget: { amount: '$45-85/hr', type: 'Hourly' },
      duration: '1+ month',
      hoursPerWeek: '30-40 hrs/week',
      experienceLevel: 'Intermediate Level',
      client: {
        rating: 4.5,
        reviews: 16,
        totalSpent: '$15k+',
        location: 'United Kingdom',
        verified: true,
        responseTime: 'Usually responds within 12 hours',
        companySize: '10-25 people',
        companyType: 'Health & Fitness startup'
      },
      skills: ['Figma', 'UI Design', 'UX Design', 'Mobile App', 'Prototyping'],
      proposals: 8,
      interviewing: 3,
      lastViewed: null,
      matchScore: 88,
      ctaText: 'Apply Now',
      featured: true,
      detailedScope: {
        work: [
          'Complete existing Figma designs (60% done)',
          'Design 5 new screens for workout tracking',
          'Create interactive prototypes',
          'Work directly with iOS/Android developers'
        ],
        deliverables: ['Complete Figma files', 'Design system', 'Prototype links'],
        teamSize: 'Work with 2 developers and 1 PM'
      }
    },
    {
      id: 3,
      title: 'Fix CSS Bugs on Landing Page',
      badge: null,
      urgency: null,
      description: 'Our company landing page has responsive issues on mobile devices. Looking for a CSS expert to diagnose and fix the problems. Should be a quick job for the right person.',
      budget: { amount: '$150', type: 'Fixed' },
      duration: '< 1 week',
      hoursPerWeek: '5-10 hrs/week',
      experienceLevel: 'Entry Level',
      client: {
        rating: 5.0,
        reviews: 3,
        totalSpent: '$1k+',
        location: 'Canada',
        verified: false,
        responseTime: 'New to platform',
        companySize: 'Small business',
        companyType: 'Marketing agency'
      },
      skills: ['HTML', 'CSS', 'Responsive Design', 'Cross-browser'],
      proposals: 3,
      interviewing: 1,
      lastViewed: '1 day ago',
      matchScore: 72,
      ctaText: 'Place Bid',
      detailedScope: {
        work: [
          'Fix mobile responsive issues',
          'Test across different devices',
          'Ensure cross-browser compatibility'
        ],
        deliverables: ['Fixed CSS files', 'Testing report'],
        teamSize: 'Independent work'
      }
    }
  ];

  const toggleSave = (jobId) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
    toast.success(savedJobs.includes(jobId) ? 'Removed from saved' : 'Saved for later');
  };

  const toggleExpand = (jobId) => {
    setExpandedJobs(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleApply = (jobId) => {
    setAppliedJobs(prev => [...prev, jobId]);
    toast.success('Application submitted successfully!', {
      description: "You'll be notified when the client responds."
    });
  };

  const handleMessage = () => {
    toast.info('Messaging feature coming soon!');
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => <span key={i}>★</span>)}
        {hasHalfStar && <span>☆</span>}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => <span key={`empty-${i}`} className="text-gray-400">☆</span>)}
      </>
    );
  };

  const getMatchColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🔥 Your Next React Gig is Here!
          </h1>
          <p className="text-lg text-muted-foreground">
            We found <strong>{opportunities.length} perfect matches</strong> for your skills in <strong>React</strong> & <strong>UI/UX Design</strong>.
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
              <Filter className="w-4 h-4" />
              All Filters
            </button>
            
            <button className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors font-medium">
              ⚡ Urgent Only
            </button>
            
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              💰 Fixed-price
            </button>
            
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              🌍 Remote-only
            </button>

            <div className="ml-auto">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-medium">
                <option>Most relevant</option>
                <option>Newest first</option>
                <option>Highest budget</option>
                <option>Best match</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project Cards */}
        <div className="space-y-4">
          {opportunities.map((project) => {
            const isSaved = savedJobs.includes(project.id);
            const isApplied = appliedJobs.includes(project.id);
            const isExpanded = expandedJobs.includes(project.id);

            return (
              <div
                key={project.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                  project.featured ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {/* Header with Badges */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-foreground hover:text-primary cursor-pointer transition-colors">
                          {project.title}
                        </h2>
                        
                        {project.urgency && (
                          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold animate-pulse">
                            ⚡ {project.urgency}
                          </span>
                        )}
                        
                        {project.client.verified && (
                          <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Payment Verified
                          </span>
                        )}
                        
                        {project.badge && (
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            project.badge.type === 'urgent' 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {project.badge.text}
                          </span>
                        )}
                      </div>

                      {/* Match Score */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <Target className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-700">Match: {project.matchScore}%</span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${getMatchColor(project.matchScore)}`}
                              style={{ width: `${project.matchScore}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Perfect fit for your React expertise!</span>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => toggleSave(project.id)}
                      className={`p-2 rounded-full transition-all ${
                        isSaved 
                          ? 'bg-red-100 text-red-500' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Budget & Timeline */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-700 text-lg">{project.budget.amount}</span>
                      <span className="text-green-600 font-medium">{project.budget.type}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">{project.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-purple-700 font-medium">{project.experienceLevel}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700 font-medium">{project.hoursPerWeek}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 leading-relaxed text-base">
                    {project.description}
                  </p>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                      {/* The Work */}
                      <div>
                        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-primary" />
                          The Work:
                        </h3>
                        <ul className="space-y-2">
                          {project.detailedScope.work.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="text-primary mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Deliverables:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {project.detailedScope.deliverables.map((item, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Team Size */}
                      <div>
                        <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          Team:
                        </h3>
                        <p className="text-gray-700">{project.detailedScope.teamSize}</p>
                      </div>
                    </div>
                  )}

                  {/* Client Info */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 text-yellow-500 text-lg">
                            {renderStars(project.client.rating)}
                            <span className="ml-1 text-gray-700 font-bold">
                              {project.client.rating}/5
                            </span>
                            <span className="text-gray-600 text-sm">
                              ({project.client.reviews} reviews)
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600">🏢</span>
                            <span className="text-gray-700">{project.client.companyType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600">👥</span>
                            <span className="text-gray-700">{project.client.companySize}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-700">{project.client.totalSpent}</span>
                            <span className="text-gray-600">total spent</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">{project.client.location}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-700 font-medium">{project.client.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Activity Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 font-medium">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{project.proposals} proposals</span>
                    </div>
                    {project.interviewing > 0 && (
                      <>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-2 font-medium text-orange-600">
                          <Zap className="w-4 h-4" />
                          <span>{project.interviewing} interviewing</span>
                        </div>
                      </>
                    )}
                    {project.lastViewed && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>Last viewed: {project.lastViewed}</span>
                      </>
                    )}
                    <span className="ml-auto text-xs text-gray-500">
                      You'll be {project.proposals + 1}rd in line
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => toggleSave(project.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                        isSaved
                          ? 'bg-red-100 text-red-600 border-2 border-red-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </button>

                    <button
                      onClick={handleMessage}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Message
                    </button>

                    <button
                      onClick={() => handleApply(project.id)}
                      disabled={isApplied}
                      className={`flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                        isApplied
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-105'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-5 h-5" />
                          Proposal Sent
                        </>
                      ) : (
                        <>
                          {project.ctaText}
                          {project.proposals > 0 && (
                            <span className="text-sm opacity-90">- {project.proposals} already applied</span>
                          )}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-5 h-5" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-5 h-5" />
                          More
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
            Load More Opportunities
          </button>
        </div>
      </div>
    </div>
  );
}