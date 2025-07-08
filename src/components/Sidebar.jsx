import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, CalendarOff, FileText, Settings, School, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';

const navLinks = [
  { to: '/', icon: Home, label: 'الرئيسية' },
  { to: '/employees', icon: Users, label: 'شؤون العاملين' },
  { to: '/absences', icon: CalendarOff, label: 'الغياب والإجازات' },
  { to: '/reports', icon: FileText, label: 'المطبوعات والتقارير' },
  { to: '/settings', icon: Settings, label: 'الإعدادات' },
];

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-40 p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/image/logo.jpg" alt="logo" className="h-10 w-10 rounded-lg" />
          <h1 className="text-lg font-bold text-foreground">إدارة شؤون العاملين</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-muted-foreground"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-card border-l border-border z-30
        w-64 transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-4 pt-20 lg:pt-4">
          {/* Logo and Title - Hidden on mobile (shown in header instead) */}
          <div className="hidden lg:flex items-center gap-3 mb-6 px-2">
            <div className="bg-primary p-2 rounded-lg">
              <img src="/image/logo.jpg" alt="logo" className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-foreground">إدارة شؤون العاملين</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 flex-grow">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base lg:text-lg ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Theme Toggle and Logout */}
          <div className="mt-auto">
            <Button 
              onClick={toggleTheme} 
              variant="ghost" 
              className="w-full justify-start gap-3 text-base lg:text-lg text-muted-foreground hover:text-accent-foreground px-4 py-3"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>{theme === 'dark' ? 'مظهر فاتح' : 'مظهر داكن'}</span>
            </Button>
            <Button 
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }} 
              variant="ghost" 
              className="w-full justify-start gap-3 text-base lg:text-lg text-red-500 hover:text-red-400 px-4 py-3"
            >
              <LogOut className="h-5 w-5" />
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
