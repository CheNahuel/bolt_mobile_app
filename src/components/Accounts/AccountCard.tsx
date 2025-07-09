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
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{account.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{account.name}</h3>
            <p className="text-sm text-gray-500">{account.currency}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${
            balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(balance, account.currency)}
          </p>
          <p className="text-xs text-gray-500">
            {accountTransactions.length} transactions
          </p>
        </div>
      </div>

      {recentTransactions.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-2">Recent transactions</p>
          <div className="space-y-1">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate">
                  {transaction.description || transaction.category}
                </span>
                <span className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
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