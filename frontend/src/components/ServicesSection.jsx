import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Zap, MapPin, CheckCircle2 } from 'lucide-react';

export default function ServicesSection() {
  const navigate = useNavigate();
  
  const services = [
    {
      icon: Briefcase,
      title: 'Projects',
      description: 'Remote & short-term contracts',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80',
      features: [
        'AI matching',
        'Milestones & Reviews',
      ],
      link: '/services/projects',
    },
    {
      icon: Zap,
      title: 'Emergency Gigs',
      description: 'Immediate help within minutes',
      badge: 'ASAP',
      badgeColor: 'badge-purple',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
      features: [
        'One-tap SOS',
        'Live ETA',
        'Safety checks',
      ],
      link: '/services/emergency-gigs',
    },
    {
      icon: MapPin,
      title: 'Gigs Near Me',
      description: 'Local tasks today/this week',
      badge: 'Local',
      badgeColor: 'badge-green',
      image: 'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=400&q=80',
      features: [
        'Radius control',
        'Verified badges',
        'Instant chat',
      ],
      link: '/services/gigs-near-me',
    },
  ];

  return (
    <section className="py-20 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Three Ways to Get Work Done
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you need urgent help, remote projects, or local tasks, we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="card hover-lift group"
              >
                {/* Image */}
                <div className="relative mb-4 rounded-xl overflow-hidden h-48">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {service.badge && (
                    <div className="absolute top-4 right-4">
                      <span className={`badge ${service.badgeColor}`}>
                        {service.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Icon & Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="icon-circle bg-primary/10 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                </div>

                <p className="text-muted-foreground mb-4">{service.description}</p>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}