import React from 'react';

export default function CategoriesSection() {
  const categories = [
    {
      title: 'Delivery & Transport',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
    },
    {
      title: 'Design & Creative',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    },
    {
      title: 'Home Services & Trades',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
    },
  ];

  return (
    <section className="py-20 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Popular Categories
          </h2>
          <p className="text-lg text-muted-foreground">
            Find opportunities in the fields you love
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden h-64 cursor-pointer hover-lift"
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white">{category.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}