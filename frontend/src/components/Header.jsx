import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-glow" />
            <span className="text-2xl font-bold text-foreground">Hapployed</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#offer" className="text-foreground hover:text-primary transition-colors font-medium">
              What we offer
            </a>
            <a href="#login" className="text-foreground hover:text-primary transition-colors font-medium">
              Log in
            </a>
            <button className="btn-primary">
              Sign up
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border space-y-4">
            <a href="#offer" className="block text-foreground hover:text-primary transition-colors font-medium">
              What we offer
            </a>
            <a href="#login" className="block text-foreground hover:text-primary transition-colors font-medium">
              Log in
            </a>
            <button className="btn-primary w-full">
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}