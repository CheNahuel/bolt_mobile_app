import React, { useState } from 'react';
import { Minus, Plus, ArrowLeftRight } from 'lucide-react';
import { Account, Transaction, Category } from '../../types';
import { formatCurrency } from '../../utils/currency';
import Header from '../Layout/Header';
import TransactionsList from '../Transactions/TransactionsList';
import TransactionForm from '../Transactions/TransactionForm';

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

  const handleTransactionSave = (transaction: Transaction) => {
    onTransactionSave(transaction);
    setShowTransactionForm(false);
    setEditingTransaction(undefined);
  };

  const handleTransactionEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleAddExpense = () => {
    setEditingTransaction(undefined);
    setShowTransactionForm(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header
        title={account.name}
        showBack
        onBack={onBack}
      />

      {/* Account Balance */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="max-w-md mx-auto text-center">
          <div className="text-4xl mb-2">{account.icon}</div>
          <h2 className="text-sm text-gray-600 mb-1">Current Balance</h2>
          <p className={`text-3xl font-bold ${
            balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(balance, account.currency)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {accountTransactions.length} transactions
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="max-w-md mx-auto space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddExpense}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <Minus size={20} />
              <span>Add Expense</span>
            </button>
            <button
              onClick={handleAddExpense}
              className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Add Income</span>
            </button>
          </div>
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors">
            <ArrowLeftRight size={18} />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <TransactionsList
        transactions={accountTransactions}
        categories={categories}
        currency={account.currency}
        onTransactionEdit={handleTransactionEdit}
      />

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          account={account}
          categories={categories}
          transaction={editingTransaction}
          onSave={handleTransactionSave}
          onCancel={() => {
            setShowTransactionForm(false);
            setEditingTransaction(undefined);
          }}
        />
      )}
    </div>
  );
};

export default AccountDetail;