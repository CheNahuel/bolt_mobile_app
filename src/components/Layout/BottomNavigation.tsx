import React from 'react';
import { BarChart3, CreditCard, Download, Settings } from 'lucide-react';

interface BottomNavigationProps {
  currentView: string;
  onViewChange: (view: 'accounts' | 'charts' | 'exports' | 'settings') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentView,
  onViewChange,
}) => {
  const navItems = [
    { id: 'monthly', label: 'Monthly', icon: Calendar },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'exports', label: 'Exports', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="nav-bottom">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`nav-item ${
              currentView === id
                ? 'active'
                : ''
            }`}
          >
            <Icon size={24} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;