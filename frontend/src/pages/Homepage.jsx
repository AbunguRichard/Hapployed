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
      <div className="relative bg-[#0a1929] overflow-hidden min-h-screen flex items-center">
        {/* Animated network background */}
        <div className="absolute inset-0">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 204, 255, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 204, 255, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }}
          />
          
          {/* Glowing geometric shapes */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Glowing nodes */}
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/80 animate-pulse" />
          <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/80 animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/80 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/80 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/3 left-2/3 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/80 animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Network lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="#00ccff" strokeWidth="1" className="animate-pulse" />
            <line x1="75%" y1="25%" x2="25%" y2="75%" stroke="#00ccff" strokeWidth="1" className="animate-pulse" />
            <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#00ccff" strokeWidth="0.5" />
            <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#00ccff" strokeWidth="0.5" />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full z-10">
          <div className="text-center">
            <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold text-white mb-6 tracking-tight leading-none">
              Work smarter.
            </h1>
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-light text-white mb-10 tracking-tight leading-none">
              Hire faster.
            </h2>
            <p className="text-xl sm:text-2xl text-white max-w-4xl mx-auto mb-12 leading-relaxed">
              The AI-powered platform that connects talent with projects in real-time
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-24">
              <button className="px-6 py-2.5 border border-white/70 text-white text-base rounded-lg font-normal hover:bg-white/10 transition-all">
                What we offer
              </button>
              <Link 
                to="/auth/login"
                className="px-6 py-2.5 border border-white/70 text-white text-base rounded-lg font-normal hover:bg-white/10 transition-all"
              >
                Sign In / Sign Up
              </Link>
            </div>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* For Talent Card */}
              <div className="relative group">
                {/* Purple glow effect - stronger */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-[2rem] blur-xl opacity-80 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative bg-gradient-to-br from-gray-50 to-white p-14 rounded-[2rem] shadow-2xl">
                  <div className="text-7xl mb-8">🚀</div>
                  <h3 className="text-3xl font-bold mb-6 text-gray-900">For Talent</h3>
                  <p className="text-gray-600 mb-12 text-xl leading-relaxed">
                    Find gigs and projects that match your skills & schedule
                  </p>
                  <Link 
                    to="/opportunities" 
                    className="inline-block px-14 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-bold text-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    Find Work
                  </Link>
                </div>
              </div>
              
              {/* For Businesses Card */}
              <div className="relative group">
                {/* Purple glow effect - stronger */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-[2rem] blur-xl opacity-80 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative bg-gradient-to-br from-gray-50 to-white p-14 rounded-[2rem] shadow-2xl">
                  <div className="text-7xl mb-8">💼</div>
                  <h3 className="text-3xl font-bold mb-6 text-gray-900">For Businesses</h3>
                  <p className="text-gray-600 mb-12 text-xl leading-relaxed">
                    Hire vetted professionals for any project size
                  </p>
                  <Link 
                    to="/find-workers" 
                    className="inline-block px-14 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
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