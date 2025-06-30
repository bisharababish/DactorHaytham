import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, MessageCircle, BookOpen, GraduationCap } from 'lucide-react';
import { getUser, removeUser, isDoctorRole } from '../utils/auth';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const user = getUser();
  const isDoctor = isDoctorRole();

  const handleLogout = () => {
    removeUser();
    window.location.reload();
  };

  const navItems = isDoctor 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
        { id: 'students', label: 'Students', icon: User },
        { id: 'grades', label: 'Grades', icon: BookOpen },
        { id: 'chat', label: 'Messages', icon: MessageCircle },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
        { id: 'exams', label: 'Exams', icon: BookOpen },
        { id: 'grades', label: 'My Grades', icon: BookOpen },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'profile', label: 'Profile', icon: User },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <GraduationCap className="h-8 w-8 text-white" />
              <h1 className="text-xl font-bold text-white">Al-Quds Medical System</h1>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      currentPage === item.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-white">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-white/70 capitalize">{user?.role}</div>
              </div>
              <motion.button
                onClick={handleLogout}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/20">
          <div className="px-4 py-2">
            <div className="flex space-x-2 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                      currentPage === item.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;