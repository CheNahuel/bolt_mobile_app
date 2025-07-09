import { Account, Transaction, Category } from '../types';
import { defaultCategories } from '../data/defaultCategories';

const STORAGE_KEYS = {
  ACCOUNTS: 'expense-tracker-accounts',
  TRANSACTIONS: 'expense-tracker-transactions',
  CATEGORIES: 'expense-tracker-categories',
};

export const storage = {
  getAccounts: (): Account[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) return [];
      
      const accounts = JSON.parse(data);
      return accounts.map((account: any) => ({
        ...account,
        createdAt: new Date(account.createdAt),
      }));
    } catch (error) {
      console.error('Error loading accounts:', error);
      return [];
    }
  },

  saveAccounts: (accounts: Account[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (error) {
      console.error('Error saving accounts:', error);
    }
  },

  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) return [];
      
      const transactions = JSON.parse(data);
      return transactions.map((transaction: any) => ({
        ...transaction,
        date: new Date(transaction.date),
        createdAt: new Date(transaction.createdAt),
      }));
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  },

  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        // Initialize with default categories
        storage.saveCategories(defaultCategories);
        return defaultCategories;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      return defaultCategories;
    }
  },

  saveCategories: (categories: Category[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};