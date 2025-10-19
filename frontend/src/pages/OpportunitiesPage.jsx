import React, { useState } from 'react';
import { Heart, MapPin, Clock, DollarSign, Users, TrendingUp, Filter } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

export default function OpportunitiesPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  const opportunities = [
    {
      id: 1,
      title: 'Revamp E-commerce Dashboard with React & TypeScript',
      badge: { text: '⭐️ Preferred', type: 'preferred' },
      description: 'We need an experienced React developer to rebuild the user dashboard for our e-commerce platform. Must have strong skills in state management (Redux) and TypeScript.',
      budget: { amount: '$2,500', type: 'Fixed' },
      duration: '2-4 weeks',
      experienceLevel: 'Expert Level',
      client: {
        rating: 4.9,
        reviews: 42,
        totalSpent: '$85k+',
        location: 'United States'
      },
      skills: ['React', 'TypeScript', 'Redux', 'CSS'],
      proposals: 15,
      lastViewed: '2 hours ago',
      ctaText: 'Send Proposal'
    },
    {
      id: 2,
      title: 'Urgent: Mobile App UI/UX Design',
      badge: { text: '🔥 Urgent Hire', type: 'urgent' },
      description: 'Our designer left suddenly. Need someone to take over Figma files and complete the UI for a fitness tracking mobile app. Must be available to start immediately.',
      budget: { amount: '$45-85/hr', type: 'Hourly' },
      duration: '1+ month',
      experienceLevel: 'Intermediate Level',
      client: {
        rating: 4.5,
        reviews: 16,
        totalSpent: '$15k+',
        location: 'United Kingdom'
      },
      skills: ['Figma', 'UI Design', 'UX Design', 'Mobile App'],
      proposals: 8,
      lastViewed: null,
      ctaText: 'Apply Now',
      featured: true
    },
    {
      id: 3,
      title: 'Fix CSS Bugs on Landing Page',
      badge: null,
      description: 'Our company landing page has responsive issues on mobile devices. Looking for a CSS expert to diagnose and fix the problems. Should be a quick job for the right person.',
      budget: { amount: '$150', type: 'Fixed' },
      duration: '< 1 week',
      experienceLevel: 'Entry Level',
      client: {
        rating: 5.0,
        reviews: 3,
        totalSpent: '$1k+',
        location: 'Canada'
      },
      skills: ['HTML', 'CSS', 'Responsive Design'],
      proposals: 3,
      lastViewed: '1 day ago',
      ctaText: 'Place Bid'
    },
    {
      id: 4,
      title: 'Build RESTful API with Node.js & MongoDB',
      badge: { text: '⭐️ Preferred', type: 'preferred' },
      description: 'Looking for a backend developer to create a scalable REST API for our SaaS product. Experience with authentication, rate limiting, and database optimization required.',
      budget: { amount: '$3,200', type: 'Fixed' },
      duration: '3-5 weeks',
      experienceLevel: 'Expert Level',
      client: {
        rating: 4.8,
        reviews: 28,
        totalSpent: '$52k+',
        location: 'Germany'
      },
      skills: ['Node.js', 'MongoDB', 'Express', 'REST API'],
      proposals: 12,
      lastViewed: '5 hours ago',
      ctaText: 'Send Proposal'
    },
    {
      id: 5,
      title: 'Create Marketing Website with Next.js',
      badge: null,
      description: 'Need a modern, SEO-optimized marketing website built with Next.js. Design files will be provided in Figma. Must be pixel-perfect and mobile-responsive.',
      budget: { amount: '$1,800', type: 'Fixed' },
      duration: '2-3 weeks',
      experienceLevel: 'Intermediate Level',
      client: {
        rating: 4.7,
        reviews: 19,
        totalSpent: '$24k+',
        location: 'Australia'
      },
      skills: ['Next.js', 'React', 'SEO', 'Tailwind CSS'],
      proposals: 22,
      lastViewed: '30 mins ago',
      ctaText: 'Send Proposal'
    }
  ];

  const toggleSave = (jobId) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleApply = (jobId) => {
    setAppliedJobs(prev => [...prev, jobId]);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Hey there, your next gig is here.
          </h1>
          <p className="text-lg text-muted-foreground">
            We found <strong>{opportunities.length} projects</strong> matching your skills in <strong>React</strong> & <strong>UI/UX Design</strong>.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="font-medium">All Filters</span>
            </button>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>Budget: Any</option>
              <option>Fixed Price</option>
              <option>Hourly Rate</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>Experience: Any</option>
              <option>Entry Level</option>
              <option>Intermediate</option>
              <option>Expert</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>Duration: Any</option>
              <option>Less than 1 week</option>
              <option>1-4 weeks</option>
              <option>1+ month</option>
            </select>
          </div>
        </div>

        {/* Project Cards */}
        <div className="space-y-4">
          {opportunities.map((project) => {
            const isSaved = savedJobs.includes(project.id);
            const isApplied = appliedJobs.includes(project.id);

            return (
              <div
                key={project.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                  project.featured ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-foreground hover:text-primary cursor-pointer transition-colors">
                          {project.title}
                        </h2>
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
                    </div>
                    <button
                      onClick={() => toggleSave(project.id)}
                      className={`p-2 rounded-full transition-all ${
                        isSaved 
                          ? 'bg-red-100 text-red-500' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Project Meta */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-700">{project.budget.amount}</span>
                      <span className="text-green-600">{project.budget.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{project.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>{project.experienceLevel}</span>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {renderStars(project.client.rating)}
                      <span className="ml-1 text-gray-700 font-medium">
                        ({project.client.rating}/5 | {project.client.reviews} reviews)
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-700">{project.client.totalSpent}</span>
                      <span>total spent</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{project.client.location}</span>
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

                  {/* Proposals & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{project.proposals} proposals</span>
                      </div>
                      {project.lastViewed && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>Last viewed: {project.lastViewed}</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleApply(project.id)}
                      disabled={isApplied}
                      className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                        isApplied
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-105'
                      }`}
                    >
                      {isApplied ? '✓ Proposal Sent' : project.ctaText}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}