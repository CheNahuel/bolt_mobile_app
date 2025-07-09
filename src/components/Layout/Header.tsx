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
    <header className="header">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={onBack}
              className="btn btn-ghost btn-sm -ml-2"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="header-title ml-2 truncate" title={title}>
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {rightContent}
          {showAdd && (
            <button
              onClick={onAdd}
              className="btn btn-primary btn-sm"
              aria-label="Add new item"
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