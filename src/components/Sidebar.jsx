import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, CalendarOff, FileText, Settings, School, Sun, Moon, LogOut } from 'lucide-react';
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

  return (
    <aside className="w-64 bg-card p-4 flex flex-col border-l border-border h-screen sticky top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-primary p-2 rounded-lg">
          {/* <School className="h-8 w-8 text-primary-foreground" /> */}
          <img src="/image/logo.jpg" alt="logo" />
        </div>
        <h1 className="text-xl font-bold text-foreground">إدارة شؤون العاملين</h1>
      </div>
      <nav className="flex flex-col gap-2 flex-grow">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-lg ${
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
      <div className="mt-auto">
        <Button onClick={toggleTheme} variant="ghost" className="w-full justify-start gap-3 text-lg text-muted-foreground hover:text-accent-foreground px-4 py-3">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>{theme === 'dark' ? 'مظهر فاتح' : 'مظهر داكن'}</span>
        </Button>
        <Button onClick={signOut} variant="ghost" className="w-full justify-start gap-3 text-lg text-red-500 hover:text-red-400 px-4 py-3">
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;