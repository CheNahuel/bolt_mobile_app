import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Account } from '../../types';
import { currencies } from '../../utils/currency';
import { generateId } from '../../utils/helpers';

interface AccountFormProps {
  account?: Account;
  onSave: (account: Account) => void;
  onCancel: () => void;
}

const accountIcons = ['💳', '🏦', '💰', '🪙', '💎', '🏧', '💸', '💵'];

const AccountForm: React.FC<AccountFormProps> = ({
  account,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    currency: account?.currency || 'USD',
    icon: account?.icon || '💳',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const accountData: Account = {
      id: account?.id || generateId(),
      name: formData.name.trim(),
      currency: formData.currency,
      icon: formData.icon,
      balance: account?.balance || 0,
      createdAt: account?.createdAt || new Date(),
    };

    onSave(accountData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-3">
            {account ? 'Edit Account' : 'Add Account'}
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
          <div className="form-group">
            <label className="form-label">
              Account Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`form-input w-full ${errors.name ? 'border-error' : ''}`}
              placeholder="e.g., Main Checking"
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="form-error">{errors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="form-select w-full"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {accountIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                    formData.icon === icon
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
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
              {account ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;