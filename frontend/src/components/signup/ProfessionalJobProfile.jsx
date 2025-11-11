import React, { useState } from 'react';
import { Briefcase, GraduationCap, Award, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ProfessionalJobProfile = ({ onComplete, userData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    desiredRole: '',
    yearsOfExperience: '',
    education: '',
    skills: [],
    skillInput: '',
    workExperience: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSkill = () => {
    if (formData.skillInput.trim() && !formData.skills.includes(formData.skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.skillInput.trim()],
        skillInput: ''
      });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.location || !formData.desiredRole) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Map experience to enum
      const experienceMapping = {
        '0-2': 'Entry',
        '2-5': 'Intermediate',
        '5+': 'Expert'
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/worker-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.account.userId,
          email: userData.account.email,
          name: formData.name,
          phone: formData.phone,
          bio: formData.workExperience,
          skills: formData.skills,
          experience: experienceMapping[formData.yearsOfExperience] || 'Entry',
          availability: 'fulltime',
          hourlyRate: null,
          location: {
            city: formData.location,
            state: '',
            country: 'USA'
          },
          categories: ['Professional Job', formData.desiredRole],
          isAvailable: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create profile');
      }

      toast.success('Profile created successfully!');
      onComplete(formData);
      
      setTimeout(() => {
        navigate('/epic-worker-dashboard');
      }, 1000);

    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Job Profile</h1>
          <p className="text-gray-600">Build your professional resume for employment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="San Francisco, CA"
              required
            />
          </div>

          {/* Desired Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="inline w-4 h-4 mr-1" />
              What role are you looking for? *
            </label>
            <input
              type="text"
              name="desiredRole"
              value={formData.desiredRole}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineer, Marketing Manager"
              required
            />
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <select
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select experience</option>
              <option value="0-2">0-2 years</option>
              <option value="2-5">2-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="inline w-4 h-4 mr-1" />
              Education
            </label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bachelor's in Computer Science"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="inline w-4 h-4 mr-1" />
              Skills
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={formData.skillInput}
                onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a skill and press Enter"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:bg-blue-100 rounded-full"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Experience
            </label>
            <textarea
              name="workExperience"
              value={formData.workExperience}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your relevant work experience and achievements..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Profile...' : 'Complete Profile'}
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalJobProfile;