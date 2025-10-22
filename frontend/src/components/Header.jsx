import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_visual-evolution/artifacts/l0gczbs1_background_AI-removebg-preview%20%281%29.png';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Hapployed" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold text-foreground">Hapployed</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/what-we-offer" className="text-foreground hover:text-primary transition-colors font-medium">
                What we offer
              </Link>
              {!isAuthenticated && (
                <Link to="/auth/login" className="text-foreground hover:text-primary transition-colors font-medium">
                  Sign In / Sign Up
                </Link>
              )}
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
              <Link to="/what-we-offer" className="block text-foreground hover:text-primary transition-colors font-medium">
                What we offer
              </Link>
              {!isAuthenticated && (
                <Link to="/auth/login" className="block text-foreground hover:text-primary transition-colors font-medium">
                  Sign In / Sign Up
                </Link>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}