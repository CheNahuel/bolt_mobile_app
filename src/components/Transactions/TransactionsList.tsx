import React from 'react';
import { Trash2 } from 'lucide-react';
import { Transaction, Category } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/helpers';

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onTransactionEdit: (transaction: Transaction) => void;
  onTransactionDelete: (transactionId: string) => void;
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  categories,
  currency,
  onTransactionEdit,
  onTransactionDelete,
}) => {
  const sortedTransactions = transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (transactions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="heading-3 mb-2">
          No transactions yet
        </h3>
        <p className="text-secondary">
          Start by adding your first expense or income
        </p>
      </div>
    );
  }

  const getCategoryIcon = (categoryName: string, type: 'expense' | 'income') => {
    const category = categories.find(c => c.name === categoryName && c.type === type);
    return category?.icon || (type === 'expense' ? '💸' : '💰');
  };

  const handleDeleteClick = (e: React.MouseEvent, transactionId: string) => {
    e.stopPropagation(); // Prevent triggering the edit action
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onTransactionDelete(transactionId);
    }
  };
  return (
    <div className="flex-1 p-4 pb-24">
      <div className="max-w-md mx-auto space-y-3">
        {sortedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            onClick={() => onTransactionEdit(transaction)}
            className="card card-interactive"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTransactionEdit(transaction);
              }
            }}
            aria-label={`Edit ${transaction.description || transaction.category} transaction`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getCategoryIcon(transaction.category, transaction.type)}
                </div>
                <div>
                  <h4 className="font-medium">
                    {transaction.description || transaction.category}
                  </h4>
                  <p className="text-sm text-muted">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-success' : 'text-error'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, currency)}
                </p>
                <p className="text-xs text-muted">
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