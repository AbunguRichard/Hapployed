import React from 'react';
import { Briefcase, Zap, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ServicesSection() {
  const navigate = useNavigate();

  const services = [
    {
      icon: Briefcase,
      title: 'Projects',
      subtitle: 'Find remote & hybrid contracts',
      description: 'Work on meaningful projects with flexible schedules and competitive rates',
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonText: 'Browse Projects',
      route: '/opportunities'
    },
    {
      icon: Zap,
      title: 'Emergency',
      subtitle: 'Quick-Hire and urgent needs near you',
      description: 'Get instant help for urgent tasks with verified professionals nearby',
      gradient: 'from-orange-500 via-red-500 to-rose-600',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badge: 'URGENT',
      badgeClass: 'bg-red-500 text-white',
      buttonText: 'View Requests',
      route: '/gigs-near-me'
    },
    {
      icon: MapPin,
      title: 'Gigs Near Me',
      subtitle: 'Explore short jobs within your area',
      description: 'Discover local opportunities and earn money in your neighborhood',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      buttonText: 'Find Local Gigs',
      route: '/gigs-near-me'
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">THREE WAYS TO GET WORK DONE</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your <span className="gradient-text">Work Style</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you need urgent help, remote projects, or local tasks, we've got the perfect solution for you.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-transparent">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative p-8 flex flex-col h-full">
                    {/* Icon Circle */}
                    <div className="relative mb-6">
                      <div className={`w-20 h-20 rounded-2xl ${service.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-md`}>
                        <Icon className={`w-10 h-10 ${service.iconColor}`} />
                      </div>
                      {service.badge && (
                        <div className="absolute -top-2 -right-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${service.badgeClass} shadow-lg animate-pulse`}>
                            {service.badge}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className={`text-2xl font-bold mb-2 group-hover:bg-gradient-to-r group-hover:${service.gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium mb-4">
                      {service.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-muted-foreground mb-8 flex-grow">
                      {service.description}
                    </p>

                    {/* CTA Button */}
                    <button
                      onClick={() => navigate(service.route)}
                      className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${service.gradient} hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group/btn`}
                    >
                      <span>{service.buttonText}</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Decorative corner */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-10 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Not sure where to start? <span className="font-semibold text-foreground">Let our AI guide you</span>
          </p>
          <button 
            onClick={() => navigate('/auth/signup')}
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Get Started Free →
          </button>
        </div>
      </div>
    </section>
  );
}