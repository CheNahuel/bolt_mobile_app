import React from 'react';
import { Transaction, Category } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/helpers';

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onTransactionEdit: (transaction: Transaction) => void;
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  categories,
  currency,
  onTransactionEdit,
}) => {
  const sortedTransactions = transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (transactions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No transactions yet
        </h3>
        <p className="text-gray-600 text-center">
          Start by adding your first expense or income
        </p>
      </div>
    );
  }

  const getCategoryIcon = (categoryName: string, type: 'expense' | 'income') => {
    const category = categories.find(c => c.name === categoryName && c.type === type);
    return category?.icon || (type === 'expense' ? '💸' : '💰');
  };

  return (
    <div className="flex-1 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-3">
        {sortedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            onClick={() => onTransactionEdit(transaction)}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getCategoryIcon(transaction.category, transaction.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {transaction.description || transaction.category}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, currency)}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.category}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsList;