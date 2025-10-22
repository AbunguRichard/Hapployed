import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, ArrowLeft, CheckCircle, TrendingUp } from 'lucide-react';
import Header from '../components/Header';

export default function RealTimeAnalyticsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 mb-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <BarChart className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">Real-time Analytics</h1>
          </div>
          <p className="text-2xl text-white/90 leading-relaxed">
            Make data-driven decisions with live insights into market trends, pricing, worker availability, 
            and project performance. Stay ahead with actionable intelligence.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Data-Driven Intelligence</h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              In today's fast-paced work environment, having access to real-time data isn't just an 
              advantage—it's essential. Hapployed's Analytics Dashboard gives you instant visibility 
              into every aspect of your hiring and project management.
            </p>
            <p>
              Our advanced analytics engine processes millions of data points every day to provide 
              you with actionable insights that help you make better decisions, faster.
            </p>
            
            {/* Stats Display */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 my-8">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">Live Market Intelligence</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-purple-400">50K+</div>
                  <div className="text-gray-300">Data Points Analyzed Daily</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">Real-time</div>
                  <div className="text-gray-300">Market Trend Updates</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">99.9%</div>
                  <div className="text-gray-300">Data Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Features */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">What You Can Track</h2>
          <div className="space-y-6">
            {[
              {
                title: 'Market Trends',
                description: 'Real-time demand for skills, pricing trends, and industry shifts. Know what\'s hot and what\'s not in your field.',
                icon: '📈'
              },
              {
                title: 'AI-Powered Price Estimation',
                description: 'Get accurate project cost estimates based on current market rates, complexity, and timeline using our AI engine.',
                icon: '💰'
              },
              {
                title: 'Worker Availability Heatmaps',
                description: 'Visual representations of professional availability by skill, location, and time zone.',
                icon: '🗺️'
              },
              {
                title: 'Project Performance Metrics',
                description: 'Track completion rates, client satisfaction scores, and delivery timelines for all your active projects.',
                icon: '📊'
              },
              {
                title: 'Budget Optimization',
                description: 'Insights on how to maximize ROI with recommendations on timing, pricing, and resource allocation.',
                icon: '🎯'
              },
              {
                title: 'Competitive Analysis',
                description: 'Benchmark your rates and offerings against market averages to stay competitive.',
                icon: '🏆'
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-4 bg-slate-700/30 p-5 rounded-xl">
                <div className="text-4xl">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Key Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Live market trend analysis',
                description: 'Stay ahead of the curve with real-time industry insights and predictions'
              },
              {
                title: 'AI-powered price estimation',
                description: 'Accurate cost predictions help you budget effectively and competitively'
              },
              {
                title: 'Worker availability insights',
                description: 'Know exactly when and where talent is available before posting'
              },
              {
                title: 'Performance tracking and reporting',
                description: 'Comprehensive dashboards show project health and success metrics'
              },
              {
                title: 'Custom Reports',
                description: 'Generate detailed reports for stakeholders and decision-makers'
              },
              {
                title: 'Predictive Analytics',
                description: 'Machine learning forecasts help you plan for future needs'
              }
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Making Data-Driven Decisions
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Access powerful analytics and insights that give you a competitive edge.
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="bg-white text-purple-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
          >
            Sign Up Now →
          </button>
        </div>
      </div>
    </div>
  );
}
