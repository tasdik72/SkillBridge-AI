import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Map, Users, Wallet, Heart, MessageSquare, Briefcase, X } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const baseNavItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/roadmap', icon: Map, label: 'AI Roadmap' },
    { path: '/community', icon: Users, label: 'Community' },
  ];

  const studentNavItems = [
    ...baseNavItems,
    { path: '/mentorship', icon: Briefcase, label: 'Find Mentors' },
    { path: '/talk', icon: MessageSquare, label: 'Talk' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
  ];

  const mentorNavItems = [
    ...baseNavItems,
    { path: '/student-requests', icon: Briefcase, label: 'Student Requests' },
    { path: '/talk', icon: MessageSquare, label: 'Talk' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
  ];

  const navItems = user?.role === 'mentor' ? mentorNavItems : studentNavItems;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="SkillBridge AI Logo" className="h-8 w-auto" />
          <span className="font-bold text-xl text-gray-900">SkillBridge AI</span>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-900">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-grow px-4 mt-4">
        <ul>
          {navItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <Link
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 my-1 rounded-lg font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex-shrink-0 hidden lg:flex flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-40 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
