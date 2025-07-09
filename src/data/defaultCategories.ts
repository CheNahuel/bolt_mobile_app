import { Category } from '../types';

export const defaultCategories: Category[] = [
  // Expense categories
  { id: '1', name: 'Food', icon: '🍽️', type: 'expense', color: '#ef4444' },
  { id: '2', name: 'Transport', icon: '🚗', type: 'expense', color: '#f97316' },
  { id: '3', name: 'Shopping', icon: '🛍️', type: 'expense', color: '#eab308' },
  { id: '4', name: 'Entertainment', icon: '🎬', type: 'expense', color: '#a855f7' },
  { id: '5', name: 'Health', icon: '🏥', type: 'expense', color: '#ec4899' },
  { id: '6', name: 'Bills', icon: '📄', type: 'expense', color: '#6b7280' },
  { id: '7', name: 'Travel', icon: '✈️', type: 'expense', color: '#06b6d4' },
  { id: '8', name: 'Education', icon: '📚', type: 'expense', color: '#8b5cf6' },
  
  // Income categories
  { id: '9', name: 'Salary', icon: '💼', type: 'income', color: '#22c55e' },
  { id: '10', name: 'Freelance', icon: '💻', type: 'income', color: '#10b981' },
  { id: '11', name: 'Investment', icon: '📈', type: 'income', color: '#059669' },
  { id: '12', name: 'Gift', icon: '🎁', type: 'income', color: '#16a34a' },
  { id: '13', name: 'Other', icon: '💰', type: 'income', color: '#15803d' },
];