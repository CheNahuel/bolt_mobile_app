import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Transaction, Category, Account } from '../../types';
import { formatCurrency } from '../../utils/currency';
import Header from '../Layout/Header';
import TransactionForm from '../Transactions/TransactionForm';
import TransactionsList from '../Transactions/TransactionsList';

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
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [initialTransactionType, setInitialTransactionType] = useState<'expense' | 'income' | null>(null);

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
    setInitialTransactionType('expense');
    setShowTransactionForm(true);
  };

  const handleAddIncome = () => {
    setEditingTransaction(undefined);
    setInitialTransactionType('income');
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setInitialTransactionType(null);
    setShowTransactionForm(true);
  };

  const handleTransactionSave = (transaction: Transaction) => {
    onTransactionSave(transaction);
    handleFormCancel();
  };

  const handleFormCancel = () => {
    setShowTransactionForm(false);
    setEditingTransaction(undefined);
    setInitialTransactionType(null);
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
            <p className={`heading-1 amount ${
              balance >= 0 ? 'text-success' : 'text-error'
            }`}>
              {formatCurrency(balance, account.currency)}
            </p>
            <p className="text-sm text-muted mt-1 truncate number">
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
              <span className="text-field">Add Expense</span>
            </button>
            <button
              onClick={handleAddIncome}
              className="btn btn-success btn-xl"
            >
              <Plus size={24} />
              <span className="text-field">Add Income</span>
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <TransactionsList
          transactions={accountTransactions}
          categories={categories}
          currency={account.currency}
          onTransactionEdit={handleEditTransaction}
          onTransactionDelete={onTransactionDelete}
        />
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          account={account}
          categories={categories}
          transaction={editingTransaction}
          initialType={initialTransactionType}
          onSave={handleTransactionSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default AccountDetail;