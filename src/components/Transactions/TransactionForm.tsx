import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Transaction, Category, Account } from '../../types';
import { generateId, formatDateInput, parseAmount, validateAmount } from '../../utils/helpers';

interface TransactionFormProps {
  account: Account;
  categories: Category[];
  transaction?: Transaction;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  account,
  categories,
  transaction,
  onSave,
  onCancel,
}) => {
  const [step, setStep] = useState<'type' | 'category' | 'details'>(
    transaction ? 'details' : 'type'
  );
  
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as 'expense' | 'income',
    amount: transaction?.amount.toString() || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction ? formatDateInput(transaction.date) : formatDateInput(new Date()),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTypeSelect = (type: 'expense' | 'income') => {
    setFormData({ ...formData, type });
    setStep('category');
  };

  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setFormData({ ...formData, category: category.name });
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

        {step === 'type' && (
          <div className="space-y-4">
            <h3 className="text-center text-secondary mb-6">Choose transaction type</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleTypeSelect('expense')}
                className="btn btn-error btn-xl w-full"
              >
                <Minus size={24} />
                <span>Add Expense</span>
              </button>
              <button
                onClick={() => handleTypeSelect('income')}
                className="btn btn-success btn-xl w-full"
              >
                <Plus size={24} />
                <span>Add Income</span>
              </button>
            </div>
          </div>
        )}

        {step === 'category' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-secondary">Select category</h3>
              <button
                onClick={() => setStep('type')}
                className="btn btn-ghost btn-sm"
              >
                Change type
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="btn btn-outline p-4 flex-col space-y-2"
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-sm font-medium">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!transaction && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    formData.type === 'expense' ? 'bg-error' : 'bg-success'
                  }`} />
                  <span className="text-sm text-secondary">
                    {formData.type === 'expense' ? 'Expense' : 'Income'} • {formData.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('category')}
                  className="btn btn-ghost btn-sm"
                >
                  Change
                </button>
              </div>
            )}

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
                {transaction ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransactionForm;