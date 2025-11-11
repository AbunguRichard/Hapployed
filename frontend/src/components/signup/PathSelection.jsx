import React from 'react';
import { Briefcase, Wrench, FolderKanban } from 'lucide-react';

const PathSelection = ({ onPathSelect }) => {
  const paths = [
    {
      id: 'professional_job',
      title: 'Professional Job',
      description: 'Full-time, part-time, or ongoing W-2 employment opportunities',
      icon: Briefcase,
      color: 'blue',
      examples: 'Software Engineer, Marketing Manager, Sales Representative'
    },
    {
      id: 'local_gigs',
      title: 'Local Gigs',
      description: 'One-time or short-term local tasks and services',
      icon: Wrench,
      color: 'green',
      examples: 'Moving help, Cleaning, Handyman, Assembly'
    },
    {
      id: 'professional_project',
      title: 'Professional Project',
      description: 'Finite, deliverable-based expert work for skilled professionals',
      icon: FolderKanban,
      color: 'purple',
      examples: 'GIS Analysis, Software Development, Consulting, Design'
    }
  ];

  const handleSelect = (pathId) => {
    onPathSelect(pathId);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            What best describes you?
          </h1>
          <p className="text-lg text-gray-600">
            Choose your path to customize your experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {paths.map((path) => {
            const Icon = path.icon;
            const colorClasses = {
              blue: 'border-blue-500 hover:border-blue-600 hover:shadow-blue-100',
              green: 'border-green-500 hover:border-green-600 hover:shadow-green-100',
              purple: 'border-purple-500 hover:border-purple-600 hover:shadow-purple-100'
            };
            const iconColorClasses = {
              blue: 'text-blue-600 bg-blue-50',
              green: 'text-green-600 bg-green-50',
              purple: 'text-purple-600 bg-purple-50'
            };

            return (
              <button
                key={path.id}
                onClick={() => handleSelect(path.id)}
                className={`
                  group p-6 border-2 rounded-2xl text-left transition-all duration-200
                  hover:shadow-lg cursor-pointer
                  ${colorClasses[path.color]}
                `}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${iconColorClasses[path.color]}`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {path.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {path.description}
                </p>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-1">Examples:</p>
                  <p className="text-xs text-gray-600">{path.examples}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Don't worry, you can always update your preferences later
        </p>
      </div>
    </div>
  );
};

export default PathSelection;
