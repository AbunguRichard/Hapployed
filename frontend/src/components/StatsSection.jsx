import React from 'react';

export default function StatsSection() {
  const stats = [
    { value: '10k+', label: 'Active Gigs' },
    { value: '50k+', label: 'Happy Workers' },
    { value: '1k+', label: 'Companies' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-lg text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}