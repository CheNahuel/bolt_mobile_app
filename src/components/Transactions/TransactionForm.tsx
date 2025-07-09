import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Transaction, Category, Account } from '../../types';
import { generateId, formatDateInput, parseAmount, validateAmount } from '../../utils/helpers';

interface TransactionFormProps {
  account: Account;
  categories: Category[];
  transaction?: Transaction;
  initialType?: 'expense' | 'income' | null;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  account,
  categories,
  transaction,
  initialType,
  onSave,
  onCancel,
}) => {
  const [step, setStep] = useState<'category' | 'details'>(
    transaction ? 'details' : 'category'
  );
  
  const [formData, setFormData] = useState({
    type: transaction?.type || initialType || 'expense' as 'expense' | 'income',
    amount: transaction?.amount.toString() || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction ? formatDateInput(transaction.date) : formatDateInput(new Date()),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data and step properly
  React.useEffect(() => {
    if (!transaction && initialType) {
      setFormData(prev => ({ ...prev, type: initialType }));
      setStep('category'); // Always show category selection for new transactions
    }
  }, [initialType, transaction]);

  const handleTypeChange = (type: 'expense' | 'income') => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      category: '' // Reset category when switching types
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setFormData(prev => ({ ...prev, category: category.name }));
      setStep('details');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!validateAmount(formData.amount)) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
      setStep('category');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const transactionData: Transaction = {
      id: transaction?.id || generateId(),
      accountId: account.id,
      type: formData.type,
      amount: parseAmount(formData.amount),
      category: formData.category,
      description: formData.description.trim() || undefined,
      date: new Date(formData.date),
      createdAt: transaction?.createdAt || new Date(),
      synced: false,
    };

    onSave(transactionData);
  };

  const availableCategories = categories.filter(c => c.type === formData.type);

  // Debug logging
  console.log('TransactionForm render:', { step, formData, availableCategories: availableCategories.length });

  if (step === 'category') {
    return (
      <div className="category-selector-overlay">
        <div className="category-selector-content">
          <div className="category-selector-header">
            <h2 className="category-selector-title">
              Select {formData.type === 'expense' ? 'Expense' : 'Income'} Category
            </h2>
            <button
              onClick={onCancel}
              className="category-selector-close"
              aria-label="Close category selector"
            >
              <X size={20} />
            </button>
          </div>

          {/* Type Toggle Buttons - Only show if no initial type was provided */}
          {!initialType && (
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`btn btn-xl transition-all ${
                    formData.type === 'expense'
                      ? 'btn-error'
                      : 'btn-outline border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Minus size={24} />
                  <span>Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`btn btn-xl transition-all ${
                    formData.type === 'income'
                      ? 'btn-success'
                      : 'btn-outline border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Plus size={24} />
                  <span>Income</span>
                </button>
              </div>
            </div>
          )}

          {/* Category Grid */}
          <div className="category-selector-grid">
            {availableCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`category-selector-item ${formData.type} click-feedback`}
                aria-label={`Select ${category.name} category`}
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
          
          {availableCategories.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-muted">No categories available for {formData.type}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-3">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                formData.type === 'expense' ? 'bg-red-500' : 'bg-green-500'
              }`} />
              <span className="text-sm font-medium">
                {formData.type === 'expense' ? 'Expense' : 'Income'} • {formData.category}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep('category')}
              className="text-blue-600 text-sm hover:text-blue-700 font-medium"
            >
              Change Category
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">
              Amount
            </label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`form-input w-full text-lg ${errors.amount ? 'border-error' : ''}`}
              placeholder="0.00"
              inputMode="decimal"
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              autoFocus
            />
            {errors.amount && (
              <p id="amount-error" className="form-error">{errors.amount}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="form-input w-full"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Description (optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input w-full"
              placeholder="Add a note..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              {transaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;