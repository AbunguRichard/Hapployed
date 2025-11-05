import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, X, Mic, Check } from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../components/DashboardHeader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PREDEFINED_SKILLS = [
  { id: 'react', name: 'React', icon: '<>', category: 'Technology' },
  { id: 'design', name: 'Design', icon: '✒️', category: 'Creative' },
  { id: 'writing', name: 'Writing', icon: '📖', category: 'Creative' },
  { id: 'accounting', name: 'Accounting', icon: '🧮', category: 'Business' },
  { id: 'marketing', name: 'Marketing', icon: '📢', category: 'Business' },
  { id: 'photography', name: 'Photography', icon: '📷', category: 'Creative' },
  { id: 'python', name: 'Python', icon: '🐍', category: 'Technology' },
  { id: 'javascript', name: 'JavaScript', icon: 'JS', category: 'Technology' },
  { id: 'nodejs', name: 'Node.js', icon: '🟢', category: 'Technology' },
  { id: 'css', name: 'CSS', icon: '🎨', category: 'Technology' },
  { id: 'project-management', name: 'Project Management', icon: '📊', category: 'Business' },
  { id: 'sales', name: 'Sales', icon: '💼', category: 'Business' },
];

export default function MySkillsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('MySkillsPage - User:', user);
    if (user) {
      loadUserSkills();
    }
  }, [user]);

  const loadUserSkills = async () => {
    try {
      const userId = user.id || user.email;
      const response = await fetch(`${BACKEND_URL}/api/worker-profiles/user/${userId}`);
      
      if (response.ok) {
        const profile = await response.json();
        if (profile.skills && profile.skills.length > 0) {
          setSelectedSkills(profile.skills);
        }
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const toggleSkill = (skillName) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillName)) {
        return prev.filter(s => s !== skillName);
      } else {
        return [...prev, skillName];
      }
    });
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
      toast.success('Skill added!');
    }
  };

  const removeSkill = (skillName) => {
    setSelectedSkills(prev => prev.filter(s => s !== skillName));
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info('Listening... Tell us your skills!');
    };

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      // Parse voice input for skills (simple implementation)
      const skills = voiceText.split(/,|and/).map(s => s.trim()).filter(s => s.length > 0);
      skills.forEach(skill => {
        if (!selectedSkills.includes(skill)) {
          setSelectedSkills(prev => [...prev, skill]);
        }
      });
      toast.success('Skills captured from voice!');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Voice input failed');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleSaveSkills = async () => {
    if (!user) {
      toast.error('Please log in to save skills');
      return;
    }

    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    setSaving(true);
    try {
      const userId = user.id || user.email;
      
      if (!userId) {
        toast.error('User ID not found. Please log in again.');
        setSaving(false);
        return;
      }
      
      // Try to get existing profile
      let profileExists = false;
      let profileId = null;
      
      try {
        const checkResponse = await fetch(`${BACKEND_URL}/api/worker-profiles/user/${userId}`);
        if (checkResponse.ok) {
          const existingProfile = await checkResponse.json();
          profileExists = true;
          profileId = existingProfile.id;
        }
      } catch (error) {
        console.log('No existing profile, will create new one');
      }

      if (profileExists && profileId) {
        // Update existing profile
        const response = await fetch(`${BACKEND_URL}/api/worker-profiles/${profileId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            skills: selectedSkills
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Update error:', errorData);
          throw new Error(errorData.detail || 'Failed to update skills');
        }
      } else {
        // Create new profile with skills
        const profileData = {
          userId: userId,
          name: user.name || user.email || 'User',
          email: user.email || `${userId}@example.com`,
          skills: selectedSkills,
          bio: '',
          hourlyRate: 0
        };
        
        console.log('Creating profile with data:', profileData);
        
        const response = await fetch(`${BACKEND_URL}/api/worker-profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Create error:', errorData);
          throw new Error(errorData.detail || 'Failed to save skills');
        }
      }

      toast.success('Skills saved successfully!');
      
      // Navigate to next step based on user role
      setTimeout(() => {
        const isWorker = user?.roles?.includes('worker') || user?.currentMode === 'worker';
        const isRecruiter = user?.roles?.includes('employer') || user?.currentMode === 'employer';
        
        if (isWorker) {
          // Navigate to worker onboarding for multi-step profile completion
          navigate('/worker/onboarding');
        } else if (isRecruiter) {
          // Navigate to recruiter dashboard
          navigate('/recruiter-dashboard');
        } else {
          // Default to epic worker dashboard
          navigate('/epic-worker-dashboard');
        }
      }, 1000); // Small delay to show success message
    } catch (error) {
      console.error('Error saving skills:', error);
      toast.error(error.message || 'Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">What kind of work do you do?</h1>
          <p className="text-lg text-gray-600">Select your skills - we'll customize your experience</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-sm font-semibold text-gray-700">Step 1 of 3</span>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-purple-600 to-green-500 rounded-full"></div>
          </div>
          <span className="text-sm font-semibold text-gray-700">33%</span>
        </div>

        {/* Voice Setup */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Mic className={`w-6 h-6 ${isRecording ? 'text-red-600 animate-pulse' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Voice Setup</h3>
                <p className="text-sm text-gray-600">Tell us what you do</p>
              </div>
            </div>
            <button
              onClick={handleVoiceInput}
              disabled={isRecording}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isRecording ? 'Recording...' : 'Start Speaking'}
            </button>
          </div>
        </div>

        {/* Professional Skills */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Professional Skills</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {PREDEFINED_SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill.name);
              return (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.name)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{skill.icon}</div>
                  <div className="text-sm font-semibold text-gray-900">{skill.name}</div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-purple-600 mt-2 mx-auto" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Add Custom Skill */}
          <div className="flex gap-3">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
              placeholder="Type a custom skill..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <button
              onClick={addCustomSkill}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add My Skill
            </button>
          </div>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Selected Skills ({selectedSkills.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-purple-200 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSaveSkills}
            disabled={saving || selectedSkills.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Skills & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
