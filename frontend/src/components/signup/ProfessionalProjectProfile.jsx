import React, { useState } from 'react';
import { FolderKanban, Code, DollarSign, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ProfessionalProjectProfile = ({ onComplete, userData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    expertise: '',
    portfolio: '',
    skills: [],
    skillInput: '',
    rateType: 'hourly',
    hourlyRate: '',
    projectRate: '',
    about: ''
  });
  const [loading, setLoading] = useState(false);

  const expertiseOptions = [
    'GIS Analyst',
    'Data Scientist',
    'UX Designer',
    'Software Developer',
    'Consultant',
    'Graphic Designer',
    'Business Analyst',
    'Project Manager'
  ];

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
    
    if (!formData.name || !formData.phone || !formData.location || !formData.expertise) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
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
          bio: formData.about,
          skills: formData.skills,
          experience: 'Expert',
          availability: 'project',
          hourlyRate: formData.rateType === 'hourly' ? parseFloat(formData.hourlyRate) : null,
          location: {
            city: formData.location,
            state: '',
            country: 'USA'
          },
          portfolio: formData.portfolio || null,
          categories: ['Professional Project', formData.expertise],
          isAvailable: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create profile');
      }

      // Update user data in localStorage to mark profile as complete
      const storedUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
      storedUserData.worker_profile = { profileComplete: true };
      localStorage.setItem('user_data', JSON.stringify(storedUserData));

      toast.success('Profile created successfully!');
      onComplete(formData);
      
      setTimeout(() => {
        navigate('/epic-worker-dashboard');
      }, 500);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Project Profile</h1>
          <p className="text-gray-600">Showcase your expertise for project-based work</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="San Francisco, CA"
              required
            />
          </div>

          {/* Professional Expertise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FolderKanban className="inline w-4 h-4 mr-1" />
              Your Professional Expertise *
            </label>
            <select
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select your expertise</option>
              {expertiseOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Portfolio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="inline w-4 h-4 mr-1" />
              Portfolio / Project Examples
            </label>
            <input
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://yourportfolio.com"
            />
            <p className="text-xs text-gray-500 mt-1">Link to your portfolio, GitHub, or work samples</p>
          </div>

          {/* Key Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Code className="inline w-4 h-4 mr-1" />
              Key Skills & Technologies
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={formData.skillInput}
                onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., ArcGIS, Python, Spatial Analysis"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:bg-purple-100 rounded-full"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Project Rates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Project Rates
            </label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rateType"
                    value="hourly"
                    checked={formData.rateType === 'hourly'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Hourly Rate
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rateType"
                    value="project"
                    checked={formData.rateType === 'project'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Fixed Price
                </label>
              </div>
              {formData.rateType === 'hourly' ? (
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="$ per hour"
                />
              ) : (
                <input
                  type="text"
                  name="projectRate"
                  value={formData.projectRate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., $5,000 - $10,000 per project"
                />
              )}
            </div>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Your Expertise
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your professional background, notable projects, and what makes you unique..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Profile...' : 'Complete Profile'}
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalProjectProfile;