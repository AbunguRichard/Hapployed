import React from 'react';
import ImageCarousel from './ImageCarousel';

const PROFESSIONAL_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1580983553600-c49a1d083f54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjB0ZWFtd29ya3xlbnwwfHx8Ymx1ZXwxNzYwNzMyMjUxfDA&ixlib=rb-4.1.0&q=85',
    alt: 'Engineers collaborating on performance tracking project in modern office',
    caption: 'Strategy in motion'
  },
  {
    url: 'https://images.unsplash.com/photo-1581090698407-7d93959da202?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxvZmZpY2UlMjB0ZWFtd29ya3xlbnwwfHx8Ymx1ZXwxNzYwNzMyMjUxfDA&ixlib=rb-4.1.0&q=85',
    alt: 'Female engineer developing innovative lighting project at workstation',
    caption: 'Ideas taking form'
  },
  {
    url: 'https://images.unsplash.com/photo-1580982324076-d95230549339?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxvZmZpY2UlMjB0ZWFtd29ya3xlbnwwfHx8Ymx1ZXwxNzYwNzMyMjUxfDA&ixlib=rb-4.1.0&q=85',
    alt: 'Engineers discussing sustainable farming solutions in collaborative workspace',
    caption: 'Teams that ship results'
  },
  {
    url: 'https://images.pexels.com/photos/7544430/pexels-photo-7544430.jpeg',
    alt: 'Futuristic tech collaboration with blue neon lighting',
    caption: 'Innovation at scale'
  },
  {
    url: 'https://images.pexels.com/photos/8728559/pexels-photo-8728559.jpeg',
    alt: 'Cyberpunk aesthetic tech team working on cutting-edge projects',
    caption: 'Building tomorrow'
  }
];

const LABOR_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1555554693-f050d589ac75?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHx3b3JrZXJzfGVufDB8fHxvcmFuZ2V8MTc2MDczMjI4Nnww&ixlib=rb-4.1.0&q=85',
    alt: 'Construction worker building structure on site with safety equipment',
    caption: 'Work done right, right now'
  },
  {
    url: 'https://images.pexels.com/photos/4687215/pexels-photo-4687215.jpeg',
    alt: 'Skilled handyman with blue hard hat and professional tools',
    caption: 'Trusted local pros'
  },
  {
    url: 'https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg',
    alt: 'Construction worker in orange safety gear working on project',
    caption: 'Everyday skill, real impact'
  },
  {
    url: 'https://images.unsplash.com/photo-1604372425350-fdf0bcebb0f4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxsYWJvcnxlbnwwfHx8fDE3NjA3MzIzMDZ8MA&ixlib=rb-4.1.0&q=85',
    alt: 'Multiple workers collaborating in field during daylight',
    caption: 'Teamwork that delivers'
  },
  {
    url: 'https://images.unsplash.com/photo-1495725274072-fd5d0b961a9f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxsYWJvcnxlbnwwfHx8fDE3NjA3MzIzMDZ8MA&ixlib=rb-4.1.0&q=85',
    alt: 'Workers on construction site in industrial environment',
    caption: 'Hands that build communities'
  }
];

export default function HeroCarouselsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Professionals Carousel */}
          <ImageCarousel
            title="Professionals in Action"
            images={PROFESSIONAL_IMAGES}
            accentColor="primary"
            gradient="from-primary/20 to-blue-500/20"
          />

          {/* General & Labor Carousel */}
          <ImageCarousel
            title="General & Labor Heroes"
            images={LABOR_IMAGES}
            accentColor="accent"
            gradient="from-accent/20 to-amber-500/20"
          />
        </div>
      </div>
    </section>
  );
}
