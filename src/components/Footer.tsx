import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-green-100 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <div className="flex justify-center space-x-6 mb-4">
          <Link to="/about" className="hover:text-gray-900">About</Link>
          <Link to="/contact" className="hover:text-gray-900">Contact</Link>
          <Link to="/privacy-policy" className="hover:text-gray-900">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-gray-900">Terms & Conditions</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} SkillBridge AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
