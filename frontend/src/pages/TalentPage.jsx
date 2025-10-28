import React, { useState } from 'react';
import TopNav from '../components/TopNav';
import { UserSearch, Zap, Briefcase, MapPin, Star, DollarSign } from 'lucide-react';

export default function TalentPage() {
  const [activeTab, setActiveTab] = useState('gig'); // 'gig' or 'professional'

  // Mock data - replace with actual API calls
  const mockWorkers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      type: 'gig',
      avatar: 'SJ',
      skills: ['Moving', 'Delivery', 'Cleaning'],
      location: 'San Francisco, CA',
      rate: 25,
      rating: 4.8,
      completedJobs: 127
    },
    {
      id: 2,
      name: 'Michael Chen',
      type: 'professional',
      avatar: 'MC',
      skills: ['React', 'Node.js', 'UI/UX'],
      location: 'Remote',
      rate: 85,
      rating: 4.9,
      completedJobs: 45
    },
    {
      id: 3,
      name: 'Emma Davis',
      type: 'gig',
      avatar: 'ED',
      skills: ['Pet Care', 'Dog Walking', 'House Sitting'],
      location: 'Seattle, WA',
      rate: 20,
      rating: 5.0,
      completedJobs: 89
    },
    {
      id: 4,
      name: 'James Wilson',
      type: 'professional',
      avatar: 'JW',
      skills: ['Python', 'Data Science', 'Machine Learning'],
      location: 'New York, NY',
      rate: 95,
      rating: 4.7,
      completedJobs: 32
    },
  ];

  const filteredWorkers = mockWorkers.filter(w => w.type === activeTab);

  const WorkerCard = ({ worker }) => (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
          worker.type === 'gig' 
            ? 'bg-gradient-to-br from-orange-500 to-red-500' 
            : 'bg-gradient-to-br from-purple-600 to-blue-600'
        }`}>
          {worker.avatar}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{worker.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            {worker.location}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold text-gray-900">{worker.rating}</span>
            </div>
            <span className="text-sm text-gray-600">
              {worker.completedJobs} jobs completed
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            worker.type === 'gig' ? 'text-orange-600' : 'text-purple-600'
          }`}>
            ${worker.rate}
            <span className="text-sm text-gray-600 font-normal">/hr</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {worker.skills.map(skill => (
          <span 
            key={skill} 
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              worker.type === 'gig'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {skill}
          </span>
        ))}
      </div>

      <button className={`w-full py-2 rounded-lg font-semibold transition-all ${
        worker.type === 'gig'
          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:brightness-110 text-white'
          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:brightness-110 text-white'
      }`}>
        View Profile
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserSearch className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Find Workers</h1>
          </div>
          <p className="text-gray-600">Discover talented professionals and gig workers for your projects</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-2 mb-8 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('gig')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'gig'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Zap className="w-5 h-5" />
            Gig Workers
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'professional'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Professional Talent
          </button>
        </div>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map(worker => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>

        {filteredWorkers.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <UserSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}
