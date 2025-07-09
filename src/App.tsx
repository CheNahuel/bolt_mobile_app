import React, { useState, useEffect } from 'react';
import { Account, Transaction, Category, AppState } from './types';
import { storage } from './utils/storage';
import { generateId } from './utils/helpers';

// Components
import BottomNavigation from './components/Layout/BottomNavigation';
import AccountsList from './components/Accounts/AccountsList';
import AccountForm from './components/Accounts/AccountForm';
import AccountDetail from './components/AccountDetail/AccountDetail';
import Charts from './components/Charts/Charts';
import Exports from './components/Exports/Exports';
import Settings from './components/Settings/Settings';

function App() {
  const [appState, setAppState] = useState<AppState>({
    accounts: [],
    transactions: [],
    categories: [],
    currentView: 'accounts',
    selectedAccountId: undefined,
  });

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  // Load data on app start
  useEffect(() => {
    const accounts = storage.getAccounts();
    const transactions = storage.getTransactions();
    const categories = storage.getCategories();

    setAppState(prev => ({
      ...prev,
      accounts,
      transactions,
      categories,
    }));
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    storage.saveAccounts(appState.accounts);
  }, [appState.accounts]);

  useEffect(() => {
    storage.saveTransactions(appState.transactions);
  }, [appState.transactions]);

  useEffect(() => {
    storage.saveCategories(appState.categories);
  }, [appState.categories]);

  const handleViewChange = (view: 'accounts' | 'charts' | 'exports' | 'settings') => {
    setAppState(prev => ({
      ...prev,
      currentView: view,
      selectedAccountId: undefined,
    }));
  };

  const handleAccountSelect = (accountId: string) => {
    setAppState(prev => ({
      ...prev,
      selectedAccountId: accountId,
    }));
  };

  const handleAccountSave = (account: Account) => {
    setAppState(prev => {
      const existingIndex = prev.accounts.findIndex(a => a.id === account.id);
      const updatedAccounts = existingIndex >= 0
        ? prev.accounts.map((a, i) => i === existingIndex ? account : a)
        : [...prev.accounts, account];

      return {
        ...prev,
        accounts: updatedAccounts,
      };
    });

    setShowAccountForm(false);
    setEditingAccount(undefined);
  };

  const handleTransactionSave = (transaction: Transaction) => {
    setAppState(prev => {
      const existingIndex = prev.transactions.findIndex(t => t.id === transaction.id);
      const updatedTransactions = existingIndex >= 0
        ? prev.transactions.map((t, i) => i === existingIndex ? transaction : t)
        : [...prev.transactions, transaction];

      return {
        ...prev,
        transactions: updatedTransactions,
      };
    });
  };

  const handleTransactionDelete = (transactionId: string) => {
    setAppState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== transactionId),
    }));
  };

  const handleDataClear = () => {
    setAppState({
      accounts: [],
      transactions: [],
      categories: storage.getCategories(), // Reload default categories
      currentView: 'accounts',
      selectedAccountId: undefined,
    });
  };

  const selectedAccount = appState.selectedAccountId
    ? appState.accounts.find(a => a.id === appState.selectedAccountId)
    : undefined;

  // Show account detail if an account is selected
  if (selectedAccount) {
    return (
      <AccountDetail
        account={selectedAccount}
        transactions={appState.transactions}
        categories={appState.categories}
        onBack={() => setAppState(prev => ({ ...prev, selectedAccountId: undefined }))}
        onTransactionSave={handleTransactionSave}
        onTransactionDelete={handleTransactionDelete}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {appState.currentView === 'accounts' && (
          <AccountsList
            accounts={appState.accounts}
            transactions={appState.transactions}
            onAccountSelect={handleAccountSelect}
            onAddAccount={() => {
              setEditingAccount(undefined);
              setShowAccountForm(true);
            }}
          />
        )}

        {appState.currentView === 'charts' && (
          <Charts
            accounts={appState.accounts}
            transactions={appState.transactions}
            categories={appState.categories}
          />
        )}

        {appState.currentView === 'exports' && (
          <Exports
            accounts={appState.accounts}
            transactions={appState.transactions}
          />
        )}

        {appState.currentView === 'settings' && (
          <Settings onDataClear={handleDataClear} />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentView={appState.currentView}
        onViewChange={handleViewChange}
      />

      {/* Account Form Modal */}
      {showAccountForm && (
        <AccountForm
          account={editingAccount}
          onSave={handleAccountSave}
          onCancel={() => {
            setShowAccountForm(false);
            setEditingAccount(undefined);
          }}
        />
      )}
    </div>
  );
}

export default App;