import React from 'react';
import { Plus } from 'lucide-react';
import { Account, Transaction } from '../../types';
import AccountCard from './AccountCard';

interface AccountsListProps {
  accounts: Account[];
  transactions: Transaction[];
  onAccountSelect: (accountId: string) => void;
  onAddAccount: () => void;
}

const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  transactions,
  onAccountSelect,
  onAddAccount,
}) => {
  if (accounts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-4">💳</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No accounts yet
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Create your first account to start tracking your expenses and income
        </p>
        <button
          onClick={onAddAccount}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Account</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            transactions={transactions}
            onClick={() => onAccountSelect(account.id)}
          />
        ))}
        
        <button
          onClick={onAddAccount}
          className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span className="font-medium">Add New Account</span>
        </button>
      </div>
    </div>
  );
};

export default AccountsList;