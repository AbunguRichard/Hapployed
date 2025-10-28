import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { Briefcase, MapPin, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Star, User, Award, TrendingUp, Target, Rocket, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function MyProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, proposal, completed

  useEffect(() => {
    if (user) {
      fetchMyProjects();
    }
  }, [user]);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const userId = user.id || user.email;
      
      // Fetch projects where user has applied or is working
      const response = await fetch(`${BACKEND_URL}/api/worker/${userId}/projects`);
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.status === 'active';
    if (filter === 'completed') return project.status === 'completed';
    if (filter === 'proposal') return project.status === 'proposal';
    return true;
  });

  const ProjectCard = ({ project }) => (
    <div 
      className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {project.location?.type || 'Remote'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {project.timeline}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.skills?.slice(0, 3).map(skill => (
              <span key={skill} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                {skill}
              </span>
            ))}
            {project.skills?.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                +{project.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          project.status === 'active' ? 'bg-green-100 text-green-700' :
          project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {project.status}
        </span>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{project.description}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-lg font-bold text-purple-600">
          <DollarSign className="w-5 h-5" />
          ${project.budget?.min} - ${project.budget?.max}
        </div>
        
        <div className="flex items-center gap-2">
          {project.status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {project.status === 'active' && (
            <Clock className="w-5 h-5 text-green-600" />
          )}
          {project.status === 'proposal' && (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
          <span className="text-sm text-gray-600">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          </div>
          <p className="text-gray-600 mb-4">Track your professional projects and long-term work opportunities</p>
          
          {/* Mode Switch */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 border-2 border-gray-200 mb-6 inline-flex">
            <button
              onClick={() => navigate('/me/gigs')}
              className="px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-white transition-all"
            >
              ⚡ My Gigs
            </button>
            <button
              className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-gray-900 shadow-md"
            >
              💼 My Projects
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-2 mb-6 inline-flex gap-2">
          {['all', 'active', 'proposal', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Empty State Hero */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center shadow-sm">
                <div className="text-6xl mb-4">💼</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready for Professional Projects?</h2>
                <p className="text-xl text-gray-700 mb-2">
                  Build your career with meaningful, long-term projects that match your expertise
                </p>
                <p className="text-gray-600">and professional goals</p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                  <div className="text-3xl mb-3">💰</div>
                  <h3 className="font-bold text-gray-900 mb-2">Higher Earnings</h3>
                  <p className="text-gray-600 text-sm">Professional projects typically pay 2-3x more than quick gigs</p>
                </div>
                <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="font-bold text-gray-900 mb-2">Career Growth</h3>
                  <p className="text-gray-600 text-sm">Build your portfolio and professional reputation</p>
                </div>
                <div className="bg-white p-6 rounded-xl border-l-4 border-purple-500 shadow-sm">
                  <div className="text-3xl mb-3">🤝</div>
                  <h3 className="font-bold text-gray-900 mb-2">Long-term Relationships</h3>
                  <p className="text-gray-600 text-sm">Develop ongoing client relationships and repeat business</p>
                </div>
                <div className="bg-white p-6 rounded-xl border-l-4 border-yellow-500 shadow-sm">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="font-bold text-gray-900 mb-2">Skill Development</h3>
                  <p className="text-gray-600 text-sm">Work on challenging projects that expand your expertise</p>
                </div>
              </div>

              {/* Steps Section */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-purple-600" />
                  Launch Your Professional Journey in 3 Steps
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">Build Your Professional Profile</h4>
                      <ul className="text-sm text-gray-600 space-y-1 mb-3">
                        <li>• Showcase your portfolio and past work</li>
                        <li>• Highlight your specialized skills</li>
                        <li>• Get endorsements and recommendations</li>
                      </ul>
                      <button 
                        onClick={() => navigate('/worker/onboarding')}
                        className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                      >
                        Enhance Profile →
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">Submit Quality Proposals</h4>
                      <ul className="text-sm text-gray-600 space-y-1 mb-3">
                        <li>• Research clients and project requirements</li>
                        <li>• Write personalized, detailed proposals</li>
                        <li>• Include relevant case studies and samples</li>
                      </ul>
                      <button 
                        onClick={() => navigate('/opportunities')}
                        className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                      >
                        Browse Projects →
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">Deliver Excellence</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Set clear milestones and deadlines</li>
                        <li>• Maintain professional communication</li>
                        <li>• Collect testimonials and build your reputation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/opportunities')}
                  className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl hover:brightness-110 transition-all shadow-lg"
                >
                  <Target className="w-8 h-8" />
                  <span className="font-bold text-center">Browse Projects</span>
                </button>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-purple-500 text-purple-700 rounded-xl hover:bg-purple-50 transition-all"
                >
                  <FileText className="w-8 h-8" />
                  <span className="font-bold text-center">Create Proposal</span>
                </button>
                <button
                  onClick={() => navigate('/worker/onboarding')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-blue-500 text-blue-700 rounded-xl hover:bg-blue-50 transition-all"
                >
                  <User className="w-8 h-8" />
                  <span className="font-bold text-center">Enhance Profile</span>
                </button>
                <button
                  onClick={() => navigate('/my-skills')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-green-500 text-green-700 rounded-xl hover:bg-green-50 transition-all"
                >
                  <Award className="w-8 h-8" />
                  <span className="font-bold text-center">Get Certified</span>
                </button>
              </div>

              {/* Project Categories */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  High-Demand Project Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Web Development', pay: '$75-150/hr', emoji: '💻', time: '2-6 months', projects: 124 },
                    { name: 'UI/UX Design', pay: '$65-120/hr', emoji: '🎨', time: '1-4 months', projects: 89 },
                    { name: 'Digital Marketing', pay: '$50-100/hr', emoji: '📱', time: '3-12 months', projects: 67 },
                    { name: 'Mobile Development', pay: '$80-160/hr', emoji: '📲', time: '3-8 months', projects: 92 },
                  ].map((category) => (
                    <div key={category.name} className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{category.emoji}</span>
                          <h4 className="font-bold text-gray-900">{category.name}</h4>
                        </div>
                        <span className="text-sm font-bold text-green-600">{category.pay}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {category.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {category.projects} open
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="mt-6 w-full py-3 bg-white border-2 border-purple-500 text-purple-700 font-bold rounded-lg hover:bg-purple-50 transition-all"
                >
                  Explore All Project Types
                </button>
              </div>

              {/* Success Stories */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Professional Success Stories
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-500">
                    <p className="text-gray-700 italic mb-3">
                      "Started with one $5,000 project, now I have ongoing contracts worth $80,000 annually. The professional network I built here transformed my freelance business."
                    </p>
                    <p className="text-sm font-semibold text-gray-600">— Sarah, Senior UX Designer</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 italic mb-3">
                      "My first project led to a long-term partnership with a tech startup. The professional approach here helped me move from gig work to building a real consulting practice."
                    </p>
                    <p className="text-sm font-semibold text-gray-600">— Michael, Full-Stack Developer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Profile Strength */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Profile Strength
                </h4>
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" style={{width: '35%'}}></div>
                </div>
                <p className="text-sm text-gray-600 mb-4">Complete your professional profile to attract better clients</p>
                <button 
                  onClick={() => navigate('/worker/onboarding')}
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                >
                  Enhance Profile →
                </button>
              </div>

              {/* Proposal Success */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Proposal Success
                </h4>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profile Completeness</span>
                    <span className="text-sm font-bold text-red-600">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Portfolio Items</span>
                    <span className="text-sm font-bold text-red-600">0 added</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Skills Certified</span>
                    <span className="text-sm font-bold text-red-600">Get certified</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">Complete profiles get 3x more interview requests</p>
              </div>

              {/* Trending Skills */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Trending Skills
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🚀 AI/ML Development - 145 open</p>
                  <p>🛡️ Cybersecurity - 89 open</p>
                  <p>☁️ Cloud Architecture - 112 open</p>
                  <p>📱 React Native - 76 open</p>
                </div>
                <button 
                  onClick={() => navigate('/opportunities')}
                  className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700"
                >
                  See skill demand trends →
                </button>
              </div>

              {/* Pro Tip */}
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  💡 Pro Tip
                </h4>
                <p className="text-sm text-white/90 mb-3">
                  "Professional clients look for specialized expertise. Focus on 2-3 core skills and build a strong portfolio around them."
                </p>
                <p className="text-xs text-white/70">— Senior Project Consultant</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
