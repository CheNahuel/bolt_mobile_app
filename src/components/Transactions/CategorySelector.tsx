import React from 'react';
import { X } from 'lucide-react';
import { Category } from '../../types';

interface CategorySelectorProps {
  isOpen: boolean;
  type: 'expense' | 'income';
  categories: Category[];
  onCategorySelect: (category: Category) => void;
  onClose: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  isOpen,
  type,
  categories,
  onCategorySelect,
  onClose,
}) => {
  const availableCategories = categories.filter(c => c.type === type);

  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category);
  };

  const handleKeyDown = (e: React.KeyboardEvent, category: Category) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCategoryClick(category);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="category-selector-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleEscapeKey}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-selector-title"
    >
      <div className="category-selector-content">
        {/* Header */}
        <div className="category-selector-header">
          <h2 id="category-selector-title" className="category-selector-title">
            Select {type === 'expense' ? 'Expense' : 'Income'} Category
          </h2>
          <button
            onClick={onClose}
            className="category-selector-close"
            aria-label="Close category selector"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Category Grid */}
        <div className="category-selector-grid">
          {availableCategories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              onKeyDown={(e) => handleKeyDown(e, category)}
              className={`category-selector-item ${type === 'expense' ? 'expense' : 'income'}`}
              type="button"
              tabIndex={0}
              aria-label={`Select ${category.name} category`}
              autoFocus={index === 0}
            >
              <div className="category-selector-icon">
                {category.icon}
              </div>
              <div className="category-selector-label">
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;