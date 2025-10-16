import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, DollarSign, Clock, AlertCircle } from 'lucide-react';

export default function PostProjectPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    duration: '',
    skills: '',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    console.log('Project posted:', formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-foreground">Post a Project</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-3xl">
        {success && (
          <div className="mb-6 p-4 bg-accent/10 text-accent rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p className="font-semibold">Project posted successfully!</p>
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-bold text-foreground mb-6">Project Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Build a React Dashboard"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your project requirements..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Remote or City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Budget
                </label>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., $5,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 2-3 weeks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Required Skills (comma separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="React, Node.js, Design"
              />
            </div>

            <button type="submit" className="w-full btn-primary">
              Post Project
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}