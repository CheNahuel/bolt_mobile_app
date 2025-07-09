import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Transaction, Category, Account } from '../../types';
import { formatCurrency } from '../../utils/currency';
import Header from '../Layout/Header';
import CategorySelector from '../Transactions/CategorySelector';
import TransactionsList from '../Transactions/TransactionsList';
import TransactionDetailsForm from '../Transactions/TransactionDetailsForm.tsx';

interface AccountDetailProps {
  account: Account;
  transactions: Transaction[];
  categories: Category[];
  onBack: () => void;
  onTransactionSave: (transaction: Transaction) => void;
  onTransactionDelete: (transactionId: string) => void;
}

const AccountDetail: React.FC<AccountDetailProps> = ({
  account,
  transactions,
  categories,
  onBack,
  onTransactionSave,
  onTransactionDelete,
}) => {
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [selectedTransactionType, setSelectedTransactionType] = useState<'expense' | 'income' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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

  const handleAddExpense = () => {
    setEditingTransaction(undefined);
    setSelectedTransactionType('expense');
    setSelectedCategory('');
    setShowCategorySelector(true);
  };

  const handleAddIncome = () => {
    setEditingTransaction(undefined);
    setSelectedTransactionType('income');
    setSelectedCategory('');
    setShowCategorySelector(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setSelectedTransactionType(transaction.type);
    setSelectedCategory(transaction.category);
    setShowDetailsForm(true);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.name);
    setShowCategorySelector(false);
    setShowDetailsForm(true);
  };

  const handleTransactionSave = (transaction: Transaction) => {
    onTransactionSave(transaction);
    handleFormCancel();
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onTransactionDelete(transactionId);
    }
  };

  const handleFormCancel = () => {
    setShowCategorySelector(false);
    setShowDetailsForm(false);
    setEditingTransaction(undefined);
    setSelectedTransactionType(null);
    setSelectedCategory('');
  };


  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        title={account.name}
        showBack
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Account Balance Card */}
        <div className="p-4">
          <div className="card text-center">
            <div className="text-4xl mb-2">{account.icon}</div>
            <h2 className="heading-3 mb-1">{account.name}</h2>
            <p className={`heading-1 ${
              balance >= 0 ? 'text-success' : 'text-error'
            }`}>
              {formatCurrency(balance, account.currency)}
            </p>
            <p className="text-sm text-muted mt-1">
              {accountTransactions.length} transactions
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddExpense}
              className="btn btn-error btn-xl"
            >
              <Minus size={24} />
              <span>Add Expense</span>
            </button>
            <button
              onClick={handleAddIncome}
              className="btn btn-success btn-xl"
            >
              <Plus size={24} />
              <span>Add Income</span>
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <TransactionsList
          transactions={accountTransactions}
          categories={categories}
          currency={account.currency}
          onTransactionEdit={handleEditTransaction}
        />
      </div>

      {/* Category Selector Popup */}
      <CategorySelector
        isOpen={showCategorySelector}
        type={selectedTransactionType || 'expense'}
        categories={categories}
        onCategorySelect={handleCategorySelect}
        onClose={handleFormCancel}
      />

      {/* Transaction Details Form Modal */}
      {showDetailsForm && selectedTransactionType && (
        <TransactionDetailsForm
          account={account}
          type={selectedTransactionType}
          category={selectedCategory}
          transaction={editingTransaction}
          onSave={handleTransactionSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default AccountDetail;