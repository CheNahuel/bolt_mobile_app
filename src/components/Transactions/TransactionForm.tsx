import React, { useState, useRef } from 'react';
import { X, Minus, Plus, Calendar } from 'lucide-react';
import Calculator from '../Calculator/Calculator';
import { Transaction, Category, Account } from '../../types';
import { generateId, formatDateInput, parseAmount } from '../../utils/helpers';
import { validateAmountInput, formatAmountInput } from '../../utils/validation';

interface TransactionFormProps {
  account: Account;
  categories: Category[];
  transaction?: Transaction;
  initialType?: 'expense' | 'income' | null;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

type DateOption = 'today' | 'yesterday' | 'other';

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
  
  // Helper functions for date handling
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (date: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const getDateOption = (date: Date): DateOption => {
    if (isToday(date)) return 'today';
    if (isYesterday(date)) return 'yesterday';
    return 'other';
  };

  const getDateFromOption = (option: DateOption): string => {
    const today = new Date();
    switch (option) {
      case 'today':
        return formatDateInput(today);
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return formatDateInput(yesterday);
      case 'other':
        // For 'other', we don't change the date - it will be set by the date picker
        return formData.date || formatDateInput(today);
      default:
        return formatDateInput(today);
    }
  };

  const initialDate = transaction ? transaction.date : new Date();
  const initialDateOption = getDateOption(initialDate);
  
  const [formData, setFormData] = useState({
    type: transaction?.type || initialType || 'expense' as 'expense' | 'income',
    amount: transaction ? formatAmountInput(transaction.amount.toString()) : '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: formatDateInput(initialDate),
  });

  const [dateOption, setDateOption] = useState<DateOption>(initialDateOption);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalculator, setShowCalculator] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Browser detection for debugging
  React.useEffect(() => {
    console.log('🌐 Browser info:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    });
    
    // Check if showPicker is supported
    const testInput = document.createElement('input');
    testInput.type = 'date';
    console.log('📱 showPicker support:', 'showPicker' in testInput);
    console.log('📱 HTMLInputElement prototype has showPicker:', 'showPicker' in HTMLInputElement.prototype);
    
    // Check if we're in a secure context (required for some APIs)
    console.log('🔒 Secure context:', window.isSecureContext);
    
    // Check if date input is supported
    testInput.value = '2023-01-01';
    console.log('📅 Date input support:', testInput.value === '2023-01-01');
  }, []);

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

  const handleDateOptionChange = (option: DateOption) => {
    console.log('🔍 handleDateOptionChange called with option:', option);
    setDateOption(option);
    
    // Only update the date for 'today' and 'yesterday', not for 'other'
    if (option !== 'other') {
      const newDate = getDateFromOption(option);
      console.log('📅 Setting date for', option, ':', newDate);
      setFormData(prev => ({ ...prev, date: newDate }));
    }
    
    // If "Other" is selected, programmatically open the date picker
    if (option === 'other') {
      console.log('🎯 "Other" selected - attempting to trigger date picker');
      console.log('📍 dateInputRef.current exists:', !!dateInputRef.current);
      
      setTimeout(() => {
        if (dateInputRef.current) {
          console.log('✅ dateInputRef.current is available in setTimeout');
          console.log('🔧 Current input element:', dateInputRef.current);
          console.log('🎨 Original style:', dateInputRef.current.style.cssText);
          
          // Store original styles
          const originalStyle = dateInputRef.current.style.cssText;
          
          // Temporarily make the input accessible for interaction
          dateInputRef.current.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            opacity: 0 !important;
            pointer-events: auto !important;
            z-index: 9999 !important;
            width: 1px !important;
            height: 1px !important;
          `;
          
          console.log('🎨 Applied temporary style:', dateInputRef.current.style.cssText);
          
          try {
            console.log('🚀 Attempting to trigger date picker...');
            
            // Use focus and click method to avoid cross-origin iframe issues
            console.log('🖱️ Using focus and click method');
            dateInputRef.current.focus();
            console.log('🎯 Focus applied');
            dateInputRef.current.click();
            console.log('🖱️ Click applied');
            console.log('✅ Date picker trigger completed successfully');
          } catch (error) {
            console.error('❌ Date picker trigger failed:', error);
            console.error('Error details:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
          }
          
          // Restore original styling after a brief delay
          setTimeout(() => {
            if (dateInputRef.current) {
              console.log('🔄 Restoring original styles');
              dateInputRef.current.style.cssText = originalStyle;
              console.log('✅ Original styles restored');
            }
          }, 100);
        } else {
          console.error('❌ dateInputRef.current is null in setTimeout');
        }
      }, 10);
    } else {
      console.log('ℹ️ Option is not "other", skipping date picker trigger');
    }
  };

  const handleHiddenDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📅 Hidden date input changed:', e.target.value);
    const selectedDate = e.target.value;
    setFormData(prev => ({ ...prev, date: selectedDate }));
    
    // Update dateOption based on the selected date
    const dateObj = new Date(selectedDate);
    const newDateOption = getDateOption(dateObj);
    console.log('🔄 Updating dateOption to:', newDateOption);
    setDateOption(newDateOption);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    const amountValidation = validateAmountInput(formData.amount);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.errorMessage || 'Please enter a valid amount';
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

  const handleCalculatorResult = (result: string) => {
    setFormData(prev => ({ ...prev, amount: result }));
    
    // Clear any existing amount errors
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const handleCalculatorClose = () => {
    setShowCalculator(false);
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
              <span 
                className="text-sm font-medium truncate" 
                title={`${formData.type === 'expense' ? 'Expense' : 'Income'} • ${formData.category}`}
              >
                {formData.type === 'expense' ? 'Expense' : 'Income'} • {formData.category}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep('category')}
              className="btn btn-outline btn-sm flex-shrink-0"
            >
              <span>Change</span>
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">
              Amount
            </label>
            <input
              type="text"
              value={formData.amount}
              onFocus={() => setShowCalculator(true)}
              onChange={(e) => {
                const value = e.target.value;
                
                // Filter input to allow only numbers, comma, and single decimal separator
                const filteredValue = value
                  .replace(/[^0-9,]/g, '') // Remove all non-numeric characters except comma
                  .replace(/(,.*?),/g, '$1') // Allow only one comma
                  .replace(/^(\d*,\d{2}).*/, '$1'); // Limit to 2 decimal places
                
                setFormData({ ...formData, amount: filteredValue });
                
                // Clear error when user starts typing
                if (errors.amount) {
                  setErrors(prev => ({ ...prev, amount: '' }));
                }
              }}
              onBlur={(e) => {
                // Format the input on blur if valid
                const validation = validateAmountInput(e.target.value.replace(',', '.'));
                if (validation.isValid && e.target.value.trim()) {
                  const formatted = formatAmountInput(e.target.value);
                  setFormData(prev => ({ ...prev, amount: formatted }));
                }
              }}
              className={`form-input w-full text-lg ${errors.amount ? 'border-error' : ''}`}
              placeholder="0,00"
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
            
            {/* Date Option Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleDateOptionChange('today')}
                className={`btn ${
                  dateOption === 'today' 
                    ? 'btn-primary' 
                    : 'btn-outline'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleDateOptionChange('yesterday')}
                className={`btn ${
                  dateOption === 'yesterday' 
                    ? 'btn-primary' 
                    : 'btn-outline'
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => handleDateOptionChange('other')}
                className={`btn ${
                  dateOption === 'other' 
                    ? 'btn-primary' 
                    : 'btn-outline'
                }`}
              >
                <Calendar size={16} />
                Other
              </button>
            </div>

            {/* Hidden Date Picker - Always present but visually hidden */}
            
            {/* DEBUG: Test button - remove this after debugging */}
            <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-xs text-yellow-800 mb-2">DEBUG MODE - Remove after fixing</p>
              <button
                type="button"
                onClick={() => {
                  console.log('🧪 DEBUG: Test button clicked');
                  console.log('🧪 dateInputRef.current:', dateInputRef.current);
                  if (dateInputRef.current) {
                    console.log('🧪 Attempting direct showPicker call...');
                    try {
                      console.log('🧪 Using focus and click method...');
                      dateInputRef.current.style.position = 'fixed';
                      dateInputRef.current.style.top = '50%';
                      dateInputRef.current.style.left = '50%';
                      dateInputRef.current.style.opacity = '0.1';
                      dateInputRef.current.style.pointerEvents = 'auto';
                      dateInputRef.current.style.zIndex = '10000';
                      dateInputRef.current.focus();
                      dateInputRef.current.click();
                      setTimeout(() => {
                        if (dateInputRef.current) {
                          dateInputRef.current.style.cssText = `
                            position: absolute; 
                            left: -9999px; 
                            width: 1px; 
                            height: 1px;
                            opacity: 0;
                            pointer-events: none;
                            visibility: hidden;
                          `;
                        }
                      }, 1000);
                    } catch (error) {
                      console.error('🧪 DEBUG test failed:', error);
                    }
                  }
                }}
                className="btn btn-sm bg-yellow-200 text-yellow-800 border-yellow-400"
              >
                🧪 Test Date Picker
              </button>
            </div>
            
            <input
              ref={dateInputRef}
              type="date"
              value={formData.date}
              onChange={handleHiddenDateInputChange}
              onFocus={() => console.log('📅 Hidden date input focused')}
              onClick={() => console.log('🖱️ Hidden date input clicked')}
              tabIndex={-1}
              style={{ 
                position: 'absolute', 
                left: '-9999px', 
                width: '1px', 
                height: '1px',
                opacity: 0,
                pointerEvents: 'none',
                visibility: 'hidden'
              }}
              aria-hidden="true"
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
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              <span>{transaction ? 'Update Transaction' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
      
      {/* Calculator Popup */}
      <Calculator
        isOpen={showCalculator}
        onClose={handleCalculatorClose}
        onResult={handleCalculatorResult}
        initialValue={formData.amount}
      />
    </div>
  );
};

export default TransactionForm;