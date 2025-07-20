import { cn, isAdmin } from '@/lib/utils';
import { Bookmark, Home, Search, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  // Add admin item for admin users
  if (isAdmin()) {
    navItems.push({ icon: Settings, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-strong z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 mb-1",
                  isActive && "fill-current"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;