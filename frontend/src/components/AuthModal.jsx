import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Briefcase, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'signin', intent = null, onSuccess }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'worker'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Track auth modal open event
      trackEvent('guest_open_auth_modal', { intent });
    }
  }, [isOpen, initialTab, intent]);

  // Track analytics event
  const trackEvent = async (eventName, metadata = {}) => {
    try {
      const anonymousId = localStorage.getItem('anonymous_id') || generateAnonymousId();
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          anonymousId,
          lastIntent: intent,
          metadata,
          device: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          referrer: document.referrer,
          page: window.location.pathname
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  const generateAnonymousId = () => {
    const id = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('anonymous_id', id);
    return id;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      
      // Track successful signin
      await trackEvent('user_signin_complete', { method: 'email' });
      
      toast.success('Welcome back!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Auto-set role based on intent
      let role = formData.role;
      if (intent === 'hire_talent' || intent === 'post_project') {
        role = 'employer';
      } else if (intent === 'find_work') {
        role = 'worker';
      }

      await signup(formData.email, formData.password, formData.name, role);
      
      // Alias anonymous events to user
      const anonymousId = localStorage.getItem('anonymous_id');
      if (anonymousId) {
        // Will be done in AuthContext after getting user ID
      }
      
      // Track successful signup
      await trackEvent('user_signup_complete', { role, method: 'email' });
      
      toast.success(`Welcome to Hapployed!`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    // Track guest mode selection
    trackEvent('guest_continue_clicked', { intent });
    
    // Store guest intent
    localStorage.setItem('user_intent', intent || '');
    localStorage.setItem('is_guest', 'true');
    
    toast.success('Browsing as guest - Sign up to apply or post jobs');
    onClose();
    if (onSuccess) onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {intent === 'find_work' && 'Sign up to find opportunities'}
            {intent === 'hire_talent' && 'Sign up to hire talent'}
            {intent === 'post_project' && 'Sign up to post your project'}
            {!intent && 'Sign in to continue'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'signin'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'signup'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setActiveTab('guest')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'guest'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Guest
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Sign In Tab */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Sign Up Tab */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Role Selection - only show if no intent */}
              {!intent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I want to...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'worker'})}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        formData.role === 'worker'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Users className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                      <div className="text-sm font-medium">Find Work</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'employer'})}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        formData.role === 'employer'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Briefcase className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                      <div className="text-sm font-medium">Hire Talent</div>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Guest Tab */}
          {activeTab === 'guest' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Users className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Continue as Guest
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Browse jobs and talent without creating an account. 
                  You'll need to sign up to apply or post.
                </p>
              </div>

              <button
                onClick={handleGuest}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Continue as Guest
              </button>

              <p className="text-xs text-center text-gray-500">
                Guest mode lets you explore, but you'll need an account to take action
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
