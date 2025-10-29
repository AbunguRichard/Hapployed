import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { FileText, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function ProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

  useEffect(() => {
    fetchProposals();
  }, [filter]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      // This endpoint would need to be created in the backend
      // For now, using mock data
      const mockProposals = [
        {
          id: '1',
          projectTitle: 'E-commerce Website Development',
          status: 'pending',
          proposedPrice: 5000,
          submittedDate: '2025-10-25',
          clientName: 'Tech Startup Inc.',
          coverLetter: 'I have extensive experience building e-commerce platforms...'
        },
        {
          id: '2',
          projectTitle: 'Mobile App UI/UX Design',
          status: 'accepted',
          proposedPrice: 3000,
          submittedDate: '2025-10-20',
          clientName: 'Design Co.',
          coverLetter: 'My portfolio includes several award-winning mobile app designs...'
        }
      ];

      setProposals(mockProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredProposals = filter === 'all' 
    ? proposals 
    : proposals.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Proposals</h1>
          <p className="text-gray-600">Track all your project proposals and their status</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['all', 'pending', 'accepted', 'rejected'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                filter === filterOption
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {filterOption}
              {filterOption === 'all' && ` (${proposals.length})`}
              {filterOption !== 'all' && ` (${proposals.filter(p => p.status === filterOption).length})`}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading proposals...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't submitted any proposals yet"
                : `You don't have any ${filter} proposals`
              }
            </p>
            <a
              href="/opportunities"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Projects
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(proposal.status)}
                      <h3 className="text-xl font-semibold text-gray-900">
                        {proposal.projectTitle}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Client: {proposal.clientName}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-2">
                    {proposal.coverLetter}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">${proposal.proposedPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Submitted {new Date(proposal.submittedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                    View Details
                  </button>
                  {proposal.status === 'accepted' && (
                    <button className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors">
                      Start Project
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
