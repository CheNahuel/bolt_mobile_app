import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Transaction, Category } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/helpers';
import ConfirmationModal from '../Common/ConfirmationModal';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | undefined>();

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

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 1) + '…';
  };

  const handleDeleteClick = (e: React.MouseEvent, transactionId: string) => {
    e.stopPropagation(); // Prevent triggering the edit action
    setTransactionToDeleteId(transactionId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDeleteId) {
      onTransactionDelete(transactionToDeleteId);
    }
    handleCancelDelete();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTransactionToDeleteId(undefined);
  };

  const getTransactionToDelete = () => {
    return transactions.find(t => t.id === transactionToDeleteId);
  };

  return (
    <div className="flex-1 pb-24">
      <div className="container py-4">
        <div className="max-w-md mx-auto space-y-3">
          {sortedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="card"
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => onTransactionEdit(transaction)}
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
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-2xl flex-shrink-0">
                    {getCategoryIcon(transaction.category, transaction.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 
                      className="font-medium truncate" 
                      title={transaction.description || transaction.category}
                    >
                      {transaction.description || transaction.category}
                    </h4>
                    <p className="text-sm text-muted">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3 flex items-center space-x-2">
                  <div>
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-error'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, currency)}
                    </p>
                    <p className="text-xs text-muted truncate" title={transaction.category}>
                      {transaction.category}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, transaction.id)}
                    className="btn btn-ghost btn-sm text-error hover:bg-red-50 p-2"
                    aria-label={`Delete ${transaction.description || transaction.category} transaction`}
                    title="Delete transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction${
          getTransactionToDelete() 
            ? ` "${getTransactionToDelete()!.description || getTransactionToDelete()!.category}"`
            : ''
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default TransactionsList;