import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Transaction, Account } from '../../types';
import { generateId, formatDateInput, parseAmount, validateAmount } from '../../utils/helpers';

interface TransactionDetailsFormProps {
  account: Account;
  type: 'expense' | 'income';
  category: string;
  transaction?: Transaction;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

const TransactionDetailsForm: React.FC<TransactionDetailsFormProps> = ({
  account,
  type,
  category,
  transaction,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    amount: transaction?.amount.toString() || '',
    description: transaction?.description || '',
    date: transaction ? formatDateInput(transaction.date) : formatDateInput(new Date()),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!validateAmount(formData.amount)) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const transactionData: Transaction = {
      id: transaction?.id || generateId(),
      accountId: account.id,
      type,
      amount: parseAmount(formData.amount),
      category,
      description: formData.description.trim() || undefined,
      date: new Date(formData.date),
      createdAt: transaction?.createdAt || new Date(),
      synced: false,
    };

    onSave(transactionData);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleEscapeKey}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-form-title"
    >
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <h2 id="transaction-form-title" className="heading-3">
            {transaction ? 'Edit Transaction' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
          </h2>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
            aria-label="Close dialog"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Display */}
        <div className={`p-4 rounded-lg mb-6 ${
          type === 'expense' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              type === 'expense' ? 'bg-red-500' : 'bg-green-500'
            }`} />
            <span className={`font-semibold ${
              type === 'expense' ? 'text-red-700' : 'text-green-700'
            }`}>
              {type === 'expense' ? 'Expense' : 'Income'}: {category}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label" htmlFor="amount">
              Amount *
            </label>
            <input
              id="amount"
              type="text"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`form-input w-full text-lg ${errors.amount ? 'border-error' : ''}`}
              placeholder="0.00"
              inputMode="decimal"
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              autoFocus
              required
            />
            {errors.amount && (
              <p id="amount-error" className="form-error" role="alert">{errors.amount}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="form-input w-full"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description (optional)
            </label>
            <input
              id="description"
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
              className={`btn flex-1 ${
                type === 'expense' ? 'btn-error' : 'btn-success'
              }`}
            >
              {transaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionDetailsForm;