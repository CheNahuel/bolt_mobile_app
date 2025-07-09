import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showAdd?: boolean;
  onAdd?: () => void;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack,
  onBack,
  showAdd,
  onAdd,
  rightContent,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 safe-area-top">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 ml-2">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {rightContent}
          {showAdd && (
            <button
              onClick={onAdd}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;