import React, { useState, useMemo } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Generate list of available months from transactions
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    
    // Add current month even if no transactions
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(currentMonth);
    
    // Add months from transactions
    transactions.forEach(transaction => {
      const month = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
      monthsSet.add(month);
    });
    
    // Convert to array and sort (newest first)
    const months = Array.from(monthsSet)
      .sort((a, b) => b.localeCompare(a))
      .map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return {
          value: month,
          label: date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })
        };
      });

    // Add "All Months" option at the top
    return [
      { value: 'all', label: 'All Months' },
      ...months
    ];
  }, [transactions]);

  // Filter transactions based on selected month and calculate balances
  const accountsWithFilteredData = useMemo(() => {
    return accounts.map(account => {
      const [year, month] = selectedMonth === 'all' ? ['', ''] : selectedMonth.split('-');
      let filteredTransactions: Transaction[];
      
      if (selectedMonth === 'all') {
        // Show all transactions
        filteredTransactions = transactions.filter(t => t.accountId === account.id);
      } else {
        // Filter by selected month
        const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        
        filteredTransactions = transactions.filter(t => 
          t.accountId === account.id &&
          t.date >= startOfMonth &&
          t.date <= endOfMonth
        );
      }
      
      // Calculate monthly income, expenses, and balance
      const monthlyIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyBalance = monthlyIncome - monthlyExpenses;
      
      return {
        account,
        monthlyIncome,
        monthlyExpenses,
        monthlyBalance,
        transactionCount: filteredTransactions.length
      };
    });
  }, [accounts, transactions, selectedMonth]);

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Month Filter Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="form-select w-full text-center text-lg font-semibold appearance-none bg-white border-2 border-primary rounded-lg px-4 py-3 cursor-pointer transition-all hover:border-primary-hover focus:ring-2 focus:ring-primary-light"
              >
                {availableMonths.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Month Filter Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="relative month-selector-container">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-select w-full text-center text-lg font-semibold appearance-none bg-white border-2 border-primary rounded-lg px-4 py-3 cursor-pointer transition-all hover:border-primary-hover focus:ring-2 focus:ring-primary-light text-field"
            >
              {availableMonths.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="flex-1 flex items-center justify-center pb-24">
        <div className="container">
          <div className="space-y-4 max-w-md mx-auto py-6">
            {accountsWithFilteredData.map(({ account, monthlyIncome, monthlyExpenses, monthlyBalance, transactionCount }) => (
              <AccountCard
                key={account.id}
                account={account}
                monthlyIncome={monthlyIncome}
                monthlyExpenses={monthlyExpenses}
                monthlyBalance={monthlyBalance}
                transactionCount={transactionCount}
                onClick={() => onAccountSelect(account.id)}
              />
            ))}
            
            <button
              onClick={onAddAccount}
              className="btn btn-outline w-full p-6 border-2 border-dashed min-h-[120px] flex flex-col items-center justify-center space-y-2"
            >
              <Plus size={20} />
              <span className="font-medium">Add New Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsList;