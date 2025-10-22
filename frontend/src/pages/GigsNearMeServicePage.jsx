import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, CheckCircle, Map, MessageCircle, Star } from 'lucide-react';
import Header from '../components/Header';

export default function GigsNearMeServicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-green-300 hover:text-green-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-12 mb-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <div>
              <div className="bg-white/30 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-2">
                🌍 LOCAL SERVICE
              </div>
              <h1 className="text-5xl font-bold text-white">Gigs Near Me</h1>
            </div>
          </div>
          <p className="text-2xl text-white/90 leading-relaxed">
            Find local help for tasks today or this week. From handymen to dog walkers, tutors to 
            photographers—connect with trusted, verified professionals in your neighborhood.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Local Help When You Need It</h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Sometimes you just need someone nearby. Whether it's moving furniture, fixing a leaky faucet, 
              tutoring your kids, or walking your dog while you're away, Gigs Near Me connects you with 
              local professionals who can help with tasks today or this week.
            </p>
            <p>
              Unlike remote projects, these are <span className="text-green-400 font-semibold">in-person, 
              local gigs</span> that require someone to show up at your location. Our location-based matching 
              ensures you only see people who can actually reach you.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">How Gigs Near Me Works</h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Set Your Location & Radius',
                description: 'Use our radius control to define how far you want to search. Choose from 1 mile to 50+ miles.',
                icon: Map
              },
              {
                step: '2',
                title: 'Describe Your Task',
                description: 'Tell us what you need done, when you need it, and your budget. Add photos if helpful.',
                icon: MessageCircle
              },
              {
                step: '3',
                title: 'Browse Local Helpers',
                description: 'See verified professionals near you with ratings, reviews, and badges. Filter by availability and skills.',
                icon: Star
              },
              {
                step: '4',
                title: 'Connect & Hire',
                description: 'Chat instantly, finalize details, and hire. Track their arrival, complete the task, and leave a review.',
                icon: CheckCircle
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-6 h-6 text-green-400" />
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    </div>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Local Gigs */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Popular Local Gigs</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '🔧', title: 'Home Repairs', examples: 'Plumbing, electrical, handyman' },
              { icon: '🚚', title: 'Moving & Delivery', examples: 'Furniture moving, pickups, hauling' },
              { icon: '🎨', title: 'Home Improvement', examples: 'Painting, landscaping, cleaning' },
              { icon: '📸', title: 'Photography', examples: 'Events, portraits, real estate' },
              { icon: '🐕', title: 'Pet Care', examples: 'Dog walking, pet sitting, grooming' },
              { icon: '👨‍🏫', title: 'Tutoring & Lessons', examples: 'Academic help, music, sports' },
              { icon: '💻', title: 'Tech Support', examples: 'Computer repair, setup, training' },
              { icon: '🎉', title: 'Event Help', examples: 'Catering, DJ, party setup' },
              { icon: '🚗', title: 'Automotive', examples: 'Car washing, detailing, minor repairs' }
            ].map((category, index) => (
              <div key={index} className="bg-slate-700/30 p-5 rounded-xl text-center">
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="text-white font-semibold mb-1">{category.title}</h3>
                <p className="text-gray-400 text-sm">{category.examples}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Radius Control',
                description: 'Adjust your search radius to find help as close or as far as you need',
                icon: '📍'
              },
              {
                title: 'Verified Badges',
                description: 'Gov-Verified and Pro-Verified badges show you can trust local helpers',
                icon: '✅'
              },
              {
                title: 'Instant Chat',
                description: 'Message local professionals directly to discuss details before hiring',
                icon: '💬'
              },
              {
                title: 'Real-Time Availability',
                description: 'See who\'s available today, this week, or at your preferred time',
                icon: '⏰'
              },
              {
                title: 'Ratings & Reviews',
                description: 'Read what neighbors and locals say about each professional',
                icon: '⭐'
              },
              {
                title: 'Safe Payments',
                description: 'Secure, escrow-protected payments released only when work is done',
                icon: '🔒'
              }
            ].map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="text-4xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Local Safety First</h2>
          <div className="space-y-4 text-gray-300 text-lg">
            <p>
              Because these are in-person gigs, we take safety seriously:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Government ID verification for all local workers',
                'Background checks and safety screenings',
                'Real-time location tracking (optional)',
                'Emergency contact system',
                'Insurance coverage for eligible services',
                'Review-based reputation system',
                'Secure messaging (no phone numbers shared until hired)',
                '24/7 safety support team'
              ].map((item, index) => (
                <div key={index} className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">How Pricing Works</h2>
          <div className="space-y-4 text-gray-300 text-lg">
            <p>
              <strong className="text-white">Transparent Rates:</strong> Local gigs are typically priced by the 
              hour or per task. You'll see rates upfront and can negotiate before hiring.
            </p>
            <p>
              <strong className="text-white">Platform Fee:</strong> We charge a small service fee (3-5%) to maintain 
              the platform, verify workers, and provide support and protection.
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-300 font-semibold">
                💡 Many local tasks cost less than you'd expect! Browse to see typical rates in your area.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Local Help?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join your neighbors in getting things done with trusted local professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth/signup')}
              className="bg-white text-green-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Sign Up to Find Local Help →
            </button>
            <button
              onClick={() => navigate('/auth/signup')}
              className="bg-green-800 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all hover:scale-105"
            >
              Sign Up to Offer Local Services →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
