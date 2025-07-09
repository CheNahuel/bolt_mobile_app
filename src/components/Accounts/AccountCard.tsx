import React from 'react';
import { Account, Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface AccountCardProps {
  account: Account;
  transactions: Transaction[];
  onClick: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  transactions,
  onClick,
}) => {
  const accountTransactions = transactions.filter(t => t.accountId === account.id);
  const balance = accountTransactions.reduce((sum, transaction) => {
    if (transaction.type === 'income') return sum + transaction.amount;
    if (transaction.type === 'expense') return sum - transaction.amount;
    if (transaction.type === 'transfer') {
      return transaction.transferToAccountId === account.id
        ? sum + transaction.amount
        : sum - transaction.amount;
    }
    return sum;
  }, 0);

  const recentTransactions = accountTransactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  return (
    <div
      onClick={onClick}
      className="card card-interactive flex flex-col justify-center min-h-[120px]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View ${account.name} account details`}
    >
      <div className="flex items-center justify-between space-x-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{account.icon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="heading-4 truncate" title={account.name}>
              {account.name}
            </h3>
            <p className="text-sm text-secondary truncate">{account.currency}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-lg font-semibold ${
            balance >= 0 ? 'text-success' : 'text-error'
          }`}>
            {formatCurrency(balance, account.currency)}
          </p>
          <p className="text-xs text-muted">
            {accountTransactions.length} transactions
          </p>
        </div>
      </div>

      {recentTransactions.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs text-muted mb-2 truncate">Recent transactions</p>
          <div className="space-y-1">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center text-sm space-x-2">
                <span 
                  className="text-secondary truncate flex-1 min-w-0" 
                  title={transaction.description || transaction.category}
                >
                  {transaction.description || transaction.category}
                </span>
                <span className={`font-semibold flex-shrink-0 ${
                  transaction.type === 'income' ? 'text-success' : 'text-error'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, account.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountCard;