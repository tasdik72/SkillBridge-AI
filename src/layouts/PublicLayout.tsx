import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import AIChatWidget from '../components/AIChatWidget';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SB</span>
              </div>
              <span className="font-bold text-xl text-gray-900">SkillBridge AI</span>
            </Link>

            {/* Centered Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">About</Link>
              <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900">Contact</Link>
              <Link to="/privacy-policy" className="text-sm font-medium text-gray-600 hover:text-gray-900">Privacy Policy</Link>
              <Link to="/terms" className="text-sm font-medium text-gray-600 hover:text-gray-900">Terms & Conditions</Link>
            </div>

            {/* Auth Button */}
            <div className="flex items-center">
              <Link
                to="/auth"
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-green-700 hover:to-teal-700 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
      <AIChatWidget />
    </div>
  );
};

export default PublicLayout;
