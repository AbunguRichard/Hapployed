import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Star, Briefcase, Clock, Shield, Mic, Sparkles, ChevronDown, ChevronUp, Award, CheckCircle, TrendingUp } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import BadgeDisplay, { BadgeFilter } from '../components/BadgeDisplay';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function FindWorkersPage() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add fadeIn animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [filters, setFilters] = useState({
    workType: 'all', // 'all', 'gigs', 'projects'
    gigCategory: 'all',
    gigUrgency: 'all',
    projectCategory: 'all',
    projectScope: 'all',
    budgetRange: 'all',
    locationRange: 'all'
  });
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [hoveredWorker, setHoveredWorker] = useState(null);
  const [expandedWorker, setExpandedWorker] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, [selectedBadges, filters, searchQuery]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      
      // Mock verified workers data
      const mockWorkers = [
        {
          id: 1,
          name: 'Sarah Johnson',
          title: 'Senior Full-Stack Developer',
          avatar: 'https://i.pravatar.cc/150?img=1',
          rating: 4.9,
          completedJobs: 127,
          hourlyRate: 85,
          location: 'San Francisco, CA',
          availability: 'Available Now',
          skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
          category: 'web-dev',
          workType: 'projects',
          badges: [
            { badge_type: 'gov-verified', badge_name: 'Gov-Verified' },
            { badge_type: 'pro-verified', badge_name: 'Pro-Verified' },
            { badge_type: 'community-trusted', badge_name: 'Community-Trusted' }
          ],
          bio: 'Experienced full-stack developer specializing in React and Node.js. Built 50+ production apps.',
          responseTime: '< 1 hour'
        },
        {
          id: 2,
          name: 'Marcus Chen',
          title: 'Certified Plumber & Electrician',
          avatar: 'https://i.pravatar.cc/150?img=2',
          rating: 4.8,
          completedJobs: 234,
          hourlyRate: 75,
          location: 'Chicago, IL',
          availability: 'Available Now',
          skills: ['Plumbing', 'Electrical', 'HVAC', 'Emergency Repairs'],
          category: 'plumbing',
          workType: 'gigs',
          urgency: 'emergency',
          badges: [
            { badge_type: 'gov-verified', badge_name: 'Gov-Verified' },
            { badge_type: 'community-trusted', badge_name: 'Community-Trusted' }
          ],
          bio: 'Licensed plumber and electrician with 15+ years experience. Available for emergency calls.',
          responseTime: '< 30 mins'
        },
        {
          id: 3,
          name: 'Emily Rodriguez',
          title: 'UI/UX Designer',
          avatar: 'https://i.pravatar.cc/150?img=3',
          rating: 5.0,
          completedJobs: 89,
          hourlyRate: 95,
          location: 'Remote',
          availability: 'Available in 2 days',
          skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
          category: 'design',
          workType: 'projects',
          badges: [
            { badge_type: 'pro-verified', badge_name: 'Pro-Verified' },
            { badge_type: 'community-trusted', badge_name: 'Community-Trusted' }
          ],
          bio: 'Award-winning designer with portfolio of 100+ successful projects. Specialized in SaaS products.',
          responseTime: '< 2 hours'
        },
        {
          id: 4,
          name: 'David Thompson',
          title: 'Professional Mover & Handyman',
          avatar: 'https://i.pravatar.cc/150?img=4',
          rating: 4.7,
          completedJobs: 312,
          hourlyRate: 45,
          location: 'New York, NY',
          availability: 'Available Now',
          skills: ['Moving', 'Assembly', 'Heavy Lifting', 'Packing'],
          category: 'moving',
          workType: 'gigs',
          urgency: 'asap',
          badges: [
            { badge_type: 'gov-verified', badge_name: 'Gov-Verified' }
          ],
          bio: 'Professional moving specialist with own truck and equipment. Same-day service available.',
          responseTime: '< 1 hour'
        },
        {
          id: 5,
          name: 'Priya Patel',
          title: 'Data Scientist & ML Engineer',
          avatar: 'https://i.pravatar.cc/150?img=5',
          rating: 4.9,
          completedJobs: 67,
          hourlyRate: 110,
          location: 'Austin, TX',
          availability: 'Available in 1 week',
          skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
          category: 'data',
          workType: 'projects',
          badges: [
            { badge_type: 'pro-verified', badge_name: 'Pro-Verified' },
            { badge_type: 'community-trusted', badge_name: 'Community-Trusted' }
          ],
          bio: 'PhD in Computer Science. Specialized in AI/ML solutions for startups and enterprises.',
          responseTime: '< 3 hours'
        },
        {
          id: 6,
          name: 'James Wilson',
          title: 'Licensed Contractor',
          avatar: 'https://i.pravatar.cc/150?img=6',
          rating: 4.8,
          completedJobs: 156,
          hourlyRate: 65,
          location: 'Los Angeles, CA',
          availability: 'Available Now',
          skills: ['Home Renovation', 'Carpentry', 'Painting', 'Drywall'],
          category: 'handyman',
          workType: 'gigs',
          urgency: 'scheduled',
          badges: [
            { badge_type: 'gov-verified', badge_name: 'Gov-Verified' },
            { badge_type: 'pro-verified', badge_name: 'Pro-Verified' }
          ],
          bio: 'Licensed general contractor with 20 years experience. Specialized in home renovations.',
          responseTime: '< 2 hours'
        }
      ];

      // Apply all filters
      let filtered = mockWorkers;
      
      // Filter by work type
      if (filters.workType !== 'all') {
        filtered = filtered.filter(worker => worker.workType === filters.workType);
      }
      
      // Filter by gig category
      if (filters.workType === 'gigs' && filters.gigCategory !== 'all') {
        filtered = filtered.filter(worker => worker.category === filters.gigCategory);
      }
      
      // Filter by gig urgency
      if (filters.workType === 'gigs' && filters.gigUrgency !== 'all') {
        filtered = filtered.filter(worker => worker.urgency === filters.gigUrgency);
      }
      
      // Filter by project category
      if (filters.workType === 'projects' && filters.projectCategory !== 'all') {
        filtered = filtered.filter(worker => worker.category === filters.projectCategory);
      }
      
      // Filter by budget range
      if (filters.budgetRange !== 'all') {
        const [min, max] = filters.budgetRange.split('-').map(v => parseInt(v.replace('+', '')));
        filtered = filtered.filter(worker => {
          if (filters.budgetRange === '1000+') {
            return worker.hourlyRate >= 100;
          }
          return worker.hourlyRate >= (min || 0) && worker.hourlyRate <= (max || 999999);
        });
      }
      
      // Filter by location (Remote filter)
      if (filters.locationRange === 'remote') {
        filtered = filtered.filter(worker => worker.location === 'Remote');
      }
      
      // Filter by selected badges
      if (selectedBadges.length > 0) {
        filtered = filtered.filter(worker => 
          selectedBadges.some(selectedBadge => 
            worker.badges.some(badge => badge.badge_type === selectedBadge)
          )
        );
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(worker => 
          worker.skills.some(skill => skill.toLowerCase().includes(query)) ||
          worker.title.toLowerCase().includes(query) ||
          worker.name.toLowerCase().includes(query)
        );
      }

      setWorkers(filtered);
      
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeToggle = (badgeType) => {
    setSelectedBadges(prev => 
      prev.includes(badgeType)
        ? prev.filter(b => b !== badgeType)
        : [...prev, badgeType]
    );
  };

  // Calculate AI Match Score based on search query and filters
  const calculateMatchScore = (worker) => {
    let score = 70; // Base score
    
    // Boost for badge count
    score += worker.badges.length * 5;
    
    // Boost for rating
    score += (worker.rating - 4.0) * 10;
    
    // Boost for search query match
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const skillMatch = worker.skills.some(skill => skill.toLowerCase().includes(query));
      const titleMatch = worker.title.toLowerCase().includes(query);
      if (skillMatch) score += 15;
      if (titleMatch) score += 10;
    }
    
    // Boost for work type match
    if (filters.workType !== 'all' && worker.workType === filters.workType) {
      score += 5;
    }
    
    // Boost for availability
    if (worker.availability === 'Available Now') {
      score += 5;
    }
    
    // Cap at 99
    return Math.min(99, Math.round(score));
  };

  const handleHireWorker = (worker) => {
    toast.success(`Sending job offer to ${worker.name}!`);
  };

  const toggleProfile = (workerId) => {
    setExpandedWorker(expandedWorker === workerId ? null : workerId);
  };

  const handleMessage = (worker) => {
    // Store worker info in session storage for message center
    sessionStorage.setItem('messageRecipient', JSON.stringify({
      id: worker.id,
      name: worker.name,
      avatar: worker.avatar,
      title: worker.title
    }));
    navigate('/messages');
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice search not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceSearching(true);
      toast.info('🎤 Listening... Speak your search criteria');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      parseVoiceSearch(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      setIsVoiceSearching(false);
      toast.error('Could not understand. Please try again');
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);
    };

    recognition.start();
  };

  // Parse voice search and apply filters
  const parseVoiceSearch = (transcript) => {
    const lower = transcript.toLowerCase();
    
    // Extract skills/profession
    const skills = ['react', 'plumber', 'plumbing', 'developer', 'designer', 'carpenter', 'electrician', 'mover', 'cleaner'];
    const foundSkill = skills.find(skill => lower.includes(skill));
    if (foundSkill) {
      setSearchQuery(foundSkill);
    }
    
    // Extract budget
    const budgetMatch = lower.match(/under (\d+)/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1]);
      if (budget <= 50) setFilters(prev => ({ ...prev, budgetRange: '0-50' }));
      else if (budget <= 100) setFilters(prev => ({ ...prev, budgetRange: '50-100' }));
      else if (budget <= 500) setFilters(prev => ({ ...prev, budgetRange: '100-500' }));
      else if (budget <= 1000) setFilters(prev => ({ ...prev, budgetRange: '500-1000' }));
      else setFilters(prev => ({ ...prev, budgetRange: '1000+' }));
    }
    
    // Extract work type
    if (lower.includes('gig') || lower.includes('local') || lower.includes('plumber') || lower.includes('electrician') || lower.includes('mover')) {
      setFilters(prev => ({ ...prev, workType: 'gigs' }));
    } else if (lower.includes('project') || lower.includes('developer') || lower.includes('designer')) {
      setFilters(prev => ({ ...prev, workType: 'projects' }));
    }
    
    // Voice feedback
    setTimeout(() => {
      const matchCount = workers.length;
      const message = `${matchCount} matching ${matchCount === 1 ? 'worker' : 'workers'} found!`;
      toast.success(message, { duration: 3000 });
      
      // Speak the result (if browser supports)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Verified Workers</h1>
            <p className="text-gray-600">Real people, real skills. Hire with confidence.</p>
          </div>
          {(filters.workType !== 'all' || selectedBadges.length > 0 || searchQuery) && (
            <button
              onClick={() => {
                setFilters({
                  workType: 'all',
                  gigCategory: 'all',
                  gigUrgency: 'all',
                  projectCategory: 'all',
                  projectScope: 'all',
                  budgetRange: 'all',
                  locationRange: 'all'
                });
                setSelectedBadges([]);
                setSearchQuery('');
              }}
              className="px-4 py-2 text-sm font-semibold text-purple-600 hover:text-purple-700 border-2 border-purple-300 rounded-lg hover:bg-purple-50 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-600">Gov-Verified</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {workers.filter(w => w.badges.some(b => b.badge_type === 'gov-verified')).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-600">Pro-Verified</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {workers.filter(w => w.badges.some(b => b.badge_type === 'pro-verified')).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-600">Community-Trusted</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {workers.filter(w => w.badges.some(b => b.badge_type === 'community-trusted')).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-lg text-white">
            <div className="text-sm font-semibold mb-1">Total Verified</div>
            <div className="text-2xl font-bold">{workers.length}</div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
              {/* Main Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Work Type
                </label>
                <select
                  value={filters.workType}
                  onChange={(e) => setFilters(prev => ({ ...prev, workType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Work Types</option>
                  <option value="gigs">🚀 Local Gigs & Tasks</option>
                  <option value="projects">💼 Professional Projects</option>
                </select>
              </div>

              {/* Gig-specific Filters */}
              {filters.workType === 'gigs' && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Gig Category
                    </label>
                    <select
                      value={filters.gigCategory}
                      onChange={(e) => setFilters(prev => ({ ...prev, gigCategory: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Local Gigs</option>
                      <option value="cleaning">🧹 Cleaning</option>
                      <option value="moving">📦 Moving & Labor</option>
                      <option value="plumbing">🔧 Plumbing</option>
                      <option value="electrical">⚡ Electrical</option>
                      <option value="handyman">🛠️ Handyman</option>
                      <option value="delivery">🚚 Delivery</option>
                      <option value="events">🎉 Event Staff</option>
                      <option value="driving">🚗 Driving</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Urgency
                    </label>
                    <select
                      value={filters.gigUrgency}
                      onChange={(e) => setFilters(prev => ({ ...prev, gigUrgency: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="all">Any Urgency</option>
                      <option value="emergency">🚨 Emergency/QuickHire</option>
                      <option value="asap">⏰ ASAP (Today)</option>
                      <option value="scheduled">📅 Scheduled</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Project-specific Filters */}
              {filters.workType === 'projects' && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Project Category
                    </label>
                    <select
                      value={filters.projectCategory}
                      onChange={(e) => setFilters(prev => ({ ...prev, projectCategory: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Projects</option>
                      <option value="web-dev">💻 Web Development</option>
                      <option value="design">🎨 Design & Creative</option>
                      <option value="writing">✍️ Writing & Content</option>
                      <option value="marketing">📈 Marketing</option>
                      <option value="consulting">💡 Consulting</option>
                      <option value="mobile">📱 Mobile Development</option>
                      <option value="data">📊 Data Science</option>
                      <option value="admin">📋 Virtual Assistant</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Project Scope
                    </label>
                    <select
                      value={filters.projectScope}
                      onChange={(e) => setFilters(prev => ({ ...prev, projectScope: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="all">Any Scope</option>
                      <option value="small">Small (1-2 weeks)</option>
                      <option value="medium">Medium (1 month)</option>
                      <option value="large">Large (2+ months)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Universal Filters */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={filters.budgetRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Any Budget</option>
                    <option value="0-50">$0 - $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-500">$100 - $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000+">$1,000+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Location
                  </label>
                  <select
                    value={filters.locationRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, locationRange: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Anywhere</option>
                    <option value="1">Within 1 mile</option>
                    <option value="5">Within 5 miles</option>
                    <option value="10">Within 10 miles</option>
                    <option value="25">Within 25 miles</option>
                    <option value="remote">🌐 Remote Only</option>
                  </select>
                </div>
              </div>

              {/* Search with Voice */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Search Skills
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="React, Plumbing, Design..."
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleVoiceSearch}
                    disabled={isVoiceSearching}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all ${
                      isVoiceSearching 
                        ? 'bg-red-100 text-red-600 animate-pulse' 
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }`}
                    title="Voice search"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                {voiceTranscript && (
                  <div className="mt-2 text-xs text-gray-600 bg-purple-50 p-2 rounded">
                    🎤 "{voiceTranscript}"
                  </div>
                )}
              </div>

              {/* Badge Filter */}
              <div className="border-t border-gray-200 pt-4">
                <BadgeFilter 
                  selectedBadges={selectedBadges}
                  onBadgeToggle={handleBadgeToggle}
                />
              </div>

              {/* Trust Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-blue-900 mb-1">100% Verified</div>
                    <div className="text-xs text-blue-700">
                      All workers shown have completed at least one verification process
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Worker Cards */}
          <div className="flex-1">
            {/* Results Header */}
            {!loading && (
              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{workers.length}</span> verified worker{workers.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading verified workers...</p>
              </div>
            ) : workers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                <button
                  onClick={() => {
                    setFilters({
                      workType: 'all',
                      gigCategory: 'all',
                      gigUrgency: 'all',
                      projectCategory: 'all',
                      projectScope: 'all',
                      budgetRange: 'all',
                      locationRange: 'all'
                    });
                    setSelectedBadges([]);
                    setSearchQuery('');
                  }}
                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {workers.map(worker => {
                  const matchScore = calculateMatchScore(worker);
                  return (
                  <div key={worker.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all relative group">
                    <div className="flex gap-6">
                      {/* Avatar with Match Score Badge */}
                      <div className="relative">
                        <img 
                          src={worker.avatar} 
                          alt={worker.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
                        />
                        {/* AI Match Score Badge - Positioned below avatar */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                          <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-fadeIn whitespace-nowrap ${
                            matchScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                            matchScore >= 80 ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                            matchScore >= 70 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            <Sparkles className="w-3 h-3" />
                            {matchScore}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{worker.name}</h3>
                            <p className="text-gray-600 mb-2">{worker.title}</p>
                            <BadgeDisplay badges={worker.badges} size="small" />
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">${worker.hourlyRate}/hr</div>
                            <div className="text-sm text-gray-600">avg rate</div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{worker.bio}</p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{worker.rating}</span>
                            <span className="text-gray-600">({worker.completedJobs} jobs)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {worker.location}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="w-4 h-4" />
                            {worker.responseTime} response
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            worker.availability === 'Available Now' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {worker.availability}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {worker.skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <div 
                            className="flex-1 relative"
                            onMouseEnter={() => setHoveredWorker(worker.id)}
                            onMouseLeave={() => setHoveredWorker(null)}
                          >
                            <button
                              onClick={() => handleHireWorker(worker)}
                              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                            >
                              Hire Now
                            </button>
                            
                            {/* Hover Preview - Micro Resume */}
                            {hoveredWorker === worker.id && (
                              <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl shadow-2xl border-2 border-purple-200 p-4 z-20 animate-fadeIn">
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                                  <img 
                                    src={worker.avatar} 
                                    alt={worker.name}
                                    className="w-12 h-12 rounded-full border-2 border-purple-300"
                                  />
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-900">{worker.name}</div>
                                    <div className="text-sm text-gray-600">{worker.title}</div>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    matchScore >= 90 ? 'bg-green-100 text-green-700' :
                                    matchScore >= 80 ? 'bg-blue-100 text-blue-700' :
                                    'bg-purple-100 text-purple-700'
                                  }`}>
                                    {matchScore}% Match
                                  </div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Rating:</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                      <span className="font-semibold">{worker.rating}</span>
                                      <span className="text-gray-500">({worker.completedJobs} jobs)</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Response Time:</span>
                                    <span className="font-semibold text-green-600">{worker.responseTime}</span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Availability:</span>
                                    <span className={`font-semibold ${
                                      worker.availability === 'Available Now' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                      {worker.availability}
                                    </span>
                                  </div>
                                  
                                  <div className="pt-2 border-t border-gray-200">
                                    <div className="text-gray-600 mb-1">Verifications:</div>
                                    <BadgeDisplay badges={worker.badges} size="small" showTooltip={false} />
                                  </div>
                                  
                                  <div className="pt-2 border-t border-gray-200">
                                    <div className="text-gray-600 mb-1">Top Skills:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {worker.skills.slice(0, 4).map((skill, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Arrow pointer */}
                                <div className="absolute top-full left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-purple-200"></div>
                              </div>
                            )}
                          </div>
                          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                            View Profile
                          </button>
                          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
