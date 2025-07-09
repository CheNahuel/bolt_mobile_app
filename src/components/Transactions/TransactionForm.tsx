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

  // Set the type from initialType if provided and not editing
  React.useEffect(() => {
    if (initialType && !transaction) {
      setFormData(prev => ({ ...prev, type: initialType }));
    }
  }, [initialType, transaction]);

  const handleTypeChange = (type: 'expense' | 'income') => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      category: '' // Reset category when switching types
    }));
    if (step === 'details') {
      setStep('category'); // Go back to category selection if we're in details
    }
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

        {/* Persistent Transaction Type Buttons */}
        <div className="mb-6">
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

        {step === 'category' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="heading-4 mb-2">
                Select {formData.type === 'expense' ? 'Expense' : 'Income'} Category
              </h3>
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                formData.type === 'expense' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {formData.type === 'expense' ? <Minus size={16} /> : <Plus size={16} />}
                <span>{formData.type === 'expense' ? 'Expense Transaction' : 'Income Transaction'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center space-y-2 click-feedback ${
                    formData.category === category.name
                      ? formData.type === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-sm font-medium text-center">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>

            {formData.category && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setStep('details')}
                  className="btn btn-primary"
                >
                  Continue with {formData.category}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'details' && (
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
        )}
      </div>
    </div>
  );
};

export default TransactionForm;