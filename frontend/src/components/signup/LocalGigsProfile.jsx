import React, { useState } from 'react';
import { Package, TrendingUp, Wrench, Home, Scissors, Car, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const LocalGigsProfile = ({ onComplete, userData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    services: [],
    about: '',
    maxDistance: '10'
  });
  const [loading, setLoading] = useState(false);

  const serviceOptions = [
    { id: 'moving', label: 'Help Moving', icon: Package },
    { id: 'assembly', label: 'Assembly', icon: Wrench },
    { id: 'cleaning', label: 'Cleaning', icon: Home },
    { id: 'landscaping', label: 'Landscaping', icon: TrendingUp },
    { id: 'painting', label: 'Painting', icon: Scissors },
    { id: 'delivery', label: 'Delivery/Transport', icon: Car }
  ];

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.location || formData.services.length === 0) {
      toast.error('Please fill in all required fields and select at least one service');
      return;
    }

    setLoading(true);

    try {
      // Create worker profile
      const profileResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/worker-profiles`, {
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
          skills: formData.services,
          experience: 'Entry',
          availability: 'flexible',
          hourlyRate: null,
          location: {
            city: formData.location,
            state: '',
            country: 'USA'
          },
          categories: ['Local Gigs'],
          isAvailable: true
        })
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.detail || 'Failed to create profile');
      }

      // Update user data in localStorage to mark profile as complete
      const storedUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
      storedUserData.worker_profile = { profileComplete: true };
      localStorage.setItem('user_data', JSON.stringify(storedUserData));

      toast.success('Profile created successfully!');
      onComplete(formData);
      
      // Navigate to gigs page
      setTimeout(() => {
        navigate('/gigs-near-me');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Local Gigs Profile</h1>
          <p className="text-gray-600">Help people find the services you offer</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="San Francisco, CA"
              required
            />
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What kind of work do you do? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {serviceOptions.map((service) => {
                const Icon = service.icon;
                const isSelected = formData.services.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceToggle(service.id)}
                    className={`
                      p-4 rounded-lg border-2 transition-all flex items-center gap-3
                      ${isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-500'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                      {service.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How far can you travel for gigs?
            </label>
            <select
              name="maxDistance"
              value={formData.maxDistance}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="5">Within 5 miles</option>
              <option value="10">Within 10 miles</option>
              <option value="15">Within 15 miles</option>
              <option value="25">Within 25 miles</option>
              <option value="50">Within 50 miles</option>
            </select>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tell people about your experience and what makes you reliable..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Profile...' : 'Complete Profile'}
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocalGigsProfile;
