export interface Account {
  id: string;
  name: string;
  currency: string;
  icon: string;
  balance: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'expense' | 'income' | 'transfer';
  amount: string;
  category: string;
  description?: string;
  date: Date;
  transferToAccountId?: string;
  createdAt: Date;
  synced: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'expense' | 'income';
  color: string;
}

export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  currentView: 'accounts' | 'charts' | 'exports' | 'settings';
  selectedAccountId?: string;
}

export interface TransactionFormData {
  type: 'expense' | 'income';
  amount: string;
  category: string;
  description: string;
  date: string;
}