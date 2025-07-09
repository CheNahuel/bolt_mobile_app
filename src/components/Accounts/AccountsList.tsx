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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">💳</div>
        <h2 className="heading-3 mb-2">
          No accounts yet
        </h2>
        <p className="text-secondary mb-6">
          Create your first account to start tracking your expenses and income
        </p>
        <button
          onClick={onAddAccount}
          className="btn btn-primary btn-lg"
        >
          <Plus size={20} />
          <span>Add Account</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-24">
      <div className="container">
        <div className="grid grid-cols-1 gap-4 py-4">
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
          className="btn btn-outline w-full p-6 border-2 border-dashed min-h-[120px]"
        >
          <Plus size={20} />
          <span className="font-medium">Add New Account</span>
        </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsList;