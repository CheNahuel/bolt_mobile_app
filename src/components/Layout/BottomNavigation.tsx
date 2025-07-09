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
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'exports', label: 'Exports', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentView === id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon size={24} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;