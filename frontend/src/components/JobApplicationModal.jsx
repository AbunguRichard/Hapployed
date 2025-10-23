import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, DollarSign, Calendar, FileText, Loader, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function JobApplicationModal({ isOpen, onClose, job, worker }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [hasSkills, setHasSkills] = useState(true);
  const [checkingSkills, setCheckingSkills] = useState(true);
  const [showSkillsPrompt, setShowSkillsPrompt] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedRate: job?.budget?.min || '',
    availableStartDate: ''
  });

  useEffect(() => {
    if (isOpen && worker) {
      checkUserSkills();
    }
  }, [isOpen, worker]);

  const checkUserSkills = async () => {
    setCheckingSkills(true);
    try {
      const userId = worker.id || worker.email;
      const response = await fetch(`${BACKEND_URL}/api/worker-profiles/user/${userId}`);
      
      if (response.ok) {
        const profile = await response.json();
        const skillsExist = profile.skills && profile.skills.length > 0;
        setHasSkills(skillsExist);
        
        if (!skillsExist) {
          setShowSkillsPrompt(true);
        }
      } else {
        setHasSkills(false);
        setShowSkillsPrompt(true);
      }
    } catch (error) {
      console.error('Error checking skills:', error);
      setHasSkills(false);
      setShowSkillsPrompt(true);
    } finally {
      setCheckingSkills(false);
    }
  };

  if (!isOpen) return null;

  const handleGoToSkills = () => {
    onClose();
    navigate('/my-skills');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasSkills) {
      setShowSkillsPrompt(true);
      return;
    }
    
    if (!formData.coverLetter.trim()) {
      toast.error('Please provide a cover letter');
      return;
    }

    setSubmitting(true);

    try {
      const applicationData = {
        jobId: job.id,
        workerId: worker.id || worker.email,
        workerEmail: worker.email,
        coverLetter: formData.coverLetter,
        proposedRate: formData.proposedRate ? parseFloat(formData.proposedRate) : null,
        availableStartDate: formData.availableStartDate || null
      };

      const response = await fetch(`${BACKEND_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit application');
      }

      const result = await response.json();
      console.log('Application submitted:', result);
      
      toast.success('Application submitted successfully!', {
        description: 'The hirer will review your application soon.'
      });
      
      onClose();
      
      // Reset form
      setFormData({
        coverLetter: '',
        proposedRate: '',
        availableStartDate: ''
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Apply for Position</h2>
              <p className="text-purple-100 text-sm">{job?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Details Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FileText className="w-4 h-4" />
              <span className="font-semibold">Category:</span> {job?.category}
            </div>
            {job?.budget && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">Budget:</span> 
                ${job.budget.min} - ${job.budget.max}
              </div>
            )}
            {job?.location && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">Location:</span> {job.location.type}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Cover Letter *
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              rows={8}
              placeholder="Introduce yourself and explain why you're a great fit for this position. Highlight relevant experience and skills..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              {formData.coverLetter.length} / 1000 characters
            </p>
          </div>

          {/* Proposed Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Proposed Rate (Optional)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                name="proposedRate"
                value={formData.proposedRate}
                onChange={handleChange}
                placeholder="Your hourly rate"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            {job?.budget && (
              <p className="mt-2 text-sm text-gray-500">
                Client's budget: ${job.budget.min} - ${job.budget.max}/hr
              </p>
            )}
          </div>

          {/* Available Start Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Available Start Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="availableStartDate"
                value={formData.availableStartDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
