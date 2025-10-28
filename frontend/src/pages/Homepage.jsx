import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Homepage() {
  const observerRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
        }
      });
    }, observerOptions);

    // Observe all animated elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-[#0a2540] overflow-hidden min-h-screen flex items-center">
        {/* Network Pattern Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0, 204, 255, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(0, 204, 255, 0.1) 1px, transparent 1px),
              linear-gradient(45deg, transparent 48%, rgba(0, 204, 255, 0.15) 49%, rgba(0, 204, 255, 0.15) 51%, transparent 52%),
              linear-gradient(-45deg, transparent 48%, rgba(0, 204, 255, 0.15) 49%, rgba(0, 204, 255, 0.15) 51%, transparent 52%)
            `,
            backgroundSize: '80px 80px, 80px 80px, 160px 160px, 160px 160px'
          }}
        />
        
        {/* Glowing nodes */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
        <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.5s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-tight">
              Work smarter.
            </h1>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-8 tracking-tight">
              Hire faster.
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed">
              The AI-powered platform that connects talent with projects in real-time
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-20">
              <button className="px-8 py-3.5 border-2 border-white/80 text-white rounded-xl font-medium hover:bg-white hover:text-[#0a2540] transition-all text-lg">
                What we offer
              </button>
              <Link 
                to="/auth/login"
                className="px-8 py-3.5 border-2 border-white/80 text-white rounded-xl font-medium hover:bg-white hover:text-[#0a2540] transition-all text-lg"
              >
                Sign In / Sign Up
              </Link>
            </div>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* For Talent Card */}
              <div className="relative group">
                {/* Purple glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative bg-white p-12 rounded-3xl shadow-2xl">
                  <div className="text-6xl mb-6">🚀</div>
                  <h3 className="text-3xl font-semibold mb-5 text-gray-900">For Talent</h3>
                  <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                    Find gigs and projects that match your skills & schedule
                  </p>
                  <Link 
                    to="/opportunities" 
                    className="inline-block px-12 py-4 bg-purple-600 text-white rounded-2xl font-semibold text-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Find Work
                  </Link>
                </div>
              </div>
              
              {/* For Businesses Card */}
              <div className="relative group">
                {/* Purple glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative bg-white p-12 rounded-3xl shadow-2xl">
                  <div className="text-6xl mb-6">💼</div>
                  <h3 className="text-3xl font-semibold mb-5 text-gray-900">For Businesses</h3>
                  <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                    Hire vetted professionals for any project size
                  </p>
                  <Link 
                    to="/find-workers" 
                    className="inline-block px-12 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold text-xl hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Hire Talent
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-20 text-gray-900">Platform Statistics</h2>
          <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            <div className="animate-on-scroll text-center">
              <div className="text-7xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
                50K+
              </div>
              <div className="text-2xl text-gray-600 font-medium">Professionals</div>
            </div>
            <div className="animate-on-scroll text-center">
              <div className="text-7xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
                2.8K+
              </div>
              <div className="text-2xl text-gray-600 font-medium">Businesses</div>
            </div>
            <div className="animate-on-scroll text-center">
              <div className="text-7xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
                98%
              </div>
              <div className="text-2xl text-gray-600 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-20 text-gray-900">Why Choose Our Platform?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
            <div className="animate-on-scroll text-center">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Smart Matching</h3>
              <p className="text-gray-600 text-lg leading-relaxed">AI connects the right talent with the right projects instantly</p>
            </div>
            <div className="animate-on-scroll text-center">
              <div className="text-6xl mb-6">⚡</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Real-Time Results</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Live updates, notifications, and instant hiring decisions</p>
            </div>
            <div className="animate-on-scroll text-center">
              <div className="text-6xl mb-6">💸</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Fair Pricing</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Transparent rates with no hidden fees for everyone</p>
            </div>
            <div className="animate-on-scroll text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Trust & Safety</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Verified profiles and secure payment protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">How It Works</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Talent */}
            <div className="animate-on-scroll bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold mb-8 text-center text-gray-800">For Talent</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold mr-4">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Create Profile</h4>
                    <p className="text-gray-600">Showcase your skills, experience, and portfolio</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold mr-4">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Get Matched</h4>
                    <p className="text-gray-600">AI finds perfect gigs and projects for your skills</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold mr-4">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Start Working</h4>
                    <p className="text-gray-600">Get hired and get paid securely through our platform</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Businesses */}
            <div className="animate-on-scroll bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold mb-8 text-center text-gray-800">For Businesses</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold mr-4">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Post Needs</h4>
                    <p className="text-gray-600">Describe your project requirements and budget</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold mr-4">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Review Matches</h4>
                    <p className="text-gray-600">AI suggests ideal candidates within minutes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold mr-4">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Hire & Manage</h4>
                    <p className="text-gray-600">Onboard and collaborate seamlessly with your team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="animate-on-scroll bg-white p-8 rounded-2xl border-l-4 border-purple-600 shadow-md">
              <p className="text-gray-600 italic mb-6">
                "Found 3 long-term clients in my first week! The AI matching is incredible and saved me hours of searching."
              </p>
              <p className="font-semibold text-gray-800">— Maria L., UX Designer</p>
            </div>
            <div className="animate-on-scroll bg-white p-8 rounded-2xl border-l-4 border-purple-600 shadow-md">
              <p className="text-gray-600 italic mb-6">
                "Hired a full development team in 48 hours. This platform saved us weeks of recruiting and interviews."
              </p>
              <p className="font-semibold text-gray-800">— TechStart Inc.</p>
            </div>
            <div className="animate-on-scroll bg-white p-8 rounded-2xl border-l-4 border-purple-600 shadow-md">
              <p className="text-gray-600 italic mb-6">
                "The real-time notifications helped me secure high-paying gigs before others even saw them. Game changer!"
              </p>
              <p className="font-semibold text-gray-800">— James K., Full-Stack Developer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white opacity-90 mb-10">
            Join thousands of professionals and businesses already thriving on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth/signup" 
              className="inline-block px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-purple-700 transition-all"
            >
              Join as Talent
            </Link>
            <Link 
              to="/post-project" 
              className="inline-block px-8 py-4 bg-white text-purple-700 rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-xl"
            >
              Hire Talent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}