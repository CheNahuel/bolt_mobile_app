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
              <h3 className="heading-4">Select category</h3>
              <button
                onClick={() => setStep('type')}
                className="btn btn-ghost btn-sm"
              >
                Change type
          <p className={`heading-1 ${
            balance >= 0 ? 'text-success' : 'text-error'
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors flex flex-col items-center space-y-2"
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
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
                    formData.type === 'expense' ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm text-gray-600">
                    {formData.type === 'expense' ? 'Expense' : 'Income'} • {formData.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('category')}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  Change
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                inputMode="decimal"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              className="btn btn-error btn-xl"
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              className="btn btn-success btn-xl"
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
          <button className="btn btn-outline w-full">
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a note..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {transaction ? 'Update' : 'Save'}
          <p className="text-sm text-muted mt-1">
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransactionForm;
      <div className="card border-b border-gray-200 rounded-none">