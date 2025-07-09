import { Category } from '../types';

export const defaultCategories: Category[] = [
  // Expense categories
  { id: '1', name: 'Food & Dining', icon: '🍽️', type: 'expense', color: '#ef4444' },
  { id: '2', name: 'Transportation', icon: '🚗', type: 'expense', color: '#f97316' },
  { id: '3', name: 'Shopping', icon: '🛍️', type: 'expense', color: '#eab308' },
  { id: '4', name: 'Entertainment', icon: '🎬', type: 'expense', color: '#a855f7' },
  { id: '5', name: 'Healthcare', icon: '🏥', type: 'expense', color: '#ec4899' },
  { id: '6', name: 'Housing & Utilities', icon: '🏠', type: 'expense', color: '#6b7280' },
  { id: '7', name: 'Travel', icon: '✈️', type: 'expense', color: '#06b6d4' },
  { id: '8', name: 'Other Expenses', icon: '💸', type: 'expense', color: '#8b5cf6' },
  
  // Income categories
  { id: '9', name: 'Salary/Wages', icon: '💼', type: 'income', color: '#22c55e' },
  { id: '10', name: 'Business Revenue', icon: '💻', type: 'income', color: '#10b981' },
  { id: '11', name: 'Investments', icon: '📈', type: 'income', color: '#059669' },
  { id: '12', name: 'Rental Income', icon: '🏠', type: 'income', color: '#16a34a' },
  { id: '13', name: 'Loans', icon: '🏦', type: 'income', color: '#15803d' },
  { id: '14', name: 'Other Income', icon: '💰', type: 'income', color: '#047857' },
];