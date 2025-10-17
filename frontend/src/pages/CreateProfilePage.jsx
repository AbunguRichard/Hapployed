import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, MapPin, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProfilePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    lookingFor: 'opportunities', // opportunities or projects
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createProfile({
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
      });
      
      // Mark as first-time user for onboarding
      localStorage.setItem('showOnboarding', 'true');
      
      // Show success toast
      toast.success('Profile created — you\'re all set!', {
        description: 'Welcome to Hapployed! Let\'s get you started.',
        duration: 3000,
      });
      
      // Small delay for toast to show, then redirect
      setTimeout(() => {
        navigate(next);
      }, 500);
    } catch (err) {
      setError('Failed to create profile. Please try again.');
      toast.error('Failed to create profile', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-alt py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Tell us about yourself to get personalized opportunities
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="San Francisco, CA"
                  required
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Skills (comma separated) *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="React, Node.js, Design, etc."
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Separate skills with commas (e.g., React, Node.js, UI Design)
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tell us about yourself, your experience, and what you're looking for..."
              />
            </div>

            {/* Looking For */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                I'm looking for:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="lookingFor"
                    value="opportunities"
                    checked={formData.lookingFor === 'opportunities'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-border rounded-lg peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <p className="font-semibold text-foreground">Opportunities</p>
                    <p className="text-sm text-muted-foreground">Find gigs and projects</p>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="lookingFor"
                    value="projects"
                    checked={formData.lookingFor === 'projects'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-border rounded-lg peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <p className="font-semibold text-foreground">Projects</p>
                    <p className="text-sm text-muted-foreground">Post work and hire</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating profile...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}