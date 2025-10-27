import React, { useState } from 'react';
import { X, Briefcase, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function RoleSwitchPrompt({ isOpen, onClose, targetRole, intent, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const { addSecondaryRole, user } = useAuth();

  const handleAddRole = async () => {
    setIsLoading(true);
    try {
      await addSecondaryRole(targetRole);
      toast.success(`${targetRole === 'worker' ? 'Worker' : 'Employer'} profile added successfully!`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to add role');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const roleConfig = {
    worker: {
      icon: Users,
      title: 'Create Worker Profile',
      description: 'Add a worker profile to find jobs and apply to opportunities.',
      benefits: [
        'Browse and apply to jobs',
        'Get matched with projects',
        'Build your profile and reputation',
        'Receive job recommendations'
      ],
      color: 'blue'
    },
    employer: {
      icon: Briefcase,
      title: 'Create Employer Profile',
      description: 'Add an employer profile to post jobs and hire talent.',
      benefits: [
        'Post projects and gigs',
        'Access talent pool',
        'Manage applicants',
        'Track hiring progress'
      ],
      color: 'purple'
    }
  };

  const config = roleConfig[targetRole] || roleConfig.employer;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${config.color}-100`}>
              <Icon className={`w-8 h-8 text-${config.color}-600`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {config.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Expand your Hapployed experience
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">You're currently signed in as:</p>
              <p className="text-blue-700">
                {user?.name} ({user?.roles?.join(', ')})
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-700">
              {config.description}
            </p>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              What you'll get:
            </h3>
            <ul className="space-y-2">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${config.color}-600 mt-2 flex-shrink-0`} />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Note */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> After creating your {targetRole} profile, you'll be able to complete your profile details and {intent === 'find_work' ? 'start applying to jobs' : intent === 'post_project' ? 'continue posting your project' : 'access all features'}.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddRole}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 bg-${config.color}-600 hover:bg-${config.color}-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50`}
          >
            {isLoading ? 'Adding...' : `Add ${targetRole === 'worker' ? 'Worker' : 'Employer'} Profile`}
          </button>
        </div>
      </div>
    </div>
  );
}
