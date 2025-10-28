import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavigationBar from '../components/NavigationBar';
import { Briefcase, MapPin, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function MyProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, proposal

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
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          </div>
          <p className="text-gray-600">Track your professional projects and proposals</p>
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
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Browse and apply to professional projects to see them here</p>
            <button
              onClick={() => navigate('/pro/find')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:brightness-110 transition-all"
            >
              Browse Projects
            </button>
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
