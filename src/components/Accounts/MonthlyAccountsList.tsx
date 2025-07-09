import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Account, Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface MonthlyAccountsListProps {
  accounts: Account[];
  transactions: Transaction[];
  onAccountSelect: (accountId: string) => void;
}

const MonthlyAccountsList: React.FC<MonthlyAccountsListProps> = ({
  accounts,
  transactions,
  onAccountSelect,
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
    return Array.from(monthsSet)
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
  }, [transactions]);

  // Calculate monthly balance for each account
  const accountsWithMonthlyBalance = useMemo(() => {
    return accounts.map(account => {
      const [year, month] = selectedMonth.split('-');
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      
      const monthlyTransactions = transactions.filter(t => 
        t.accountId === account.id &&
        t.date >= startOfMonth &&
        t.date <= endOfMonth
      );
      
      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyBalance = monthlyIncome - monthlyExpenses;
      
      return {
        ...account,
        monthlyIncome,
        monthlyExpenses,
        monthlyBalance,
        transactionCount: monthlyTransactions.length
      };
    });
  }, [accounts, transactions, selectedMonth]);

  const formatMonthDisplay = (monthValue: string) => {
    const [year, month] = monthValue.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (accounts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="heading-3 mb-2">
          No accounts yet
        </h2>
        <p className="text-secondary">
          Create your first account to see monthly performance
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with Month Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="heading-2 text-center mb-4">
            Monthly Overview
          </h1>
          
          {/* Month Selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-select w-full text-center text-lg font-semibold appearance-none bg-white border-2 border-primary rounded-lg px-4 py-3 pr-10 cursor-pointer transition-all hover:border-primary-hover focus:ring-2 focus:ring-primary-light"
            >
              {availableMonths.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={20} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="flex-1 flex items-center justify-center pb-24">
        <div className="container">
          <div className="space-y-4 max-w-md mx-auto py-6">
            {accountsWithMonthlyBalance.map((account) => (
              <div
                key={account.id}
                onClick={() => onAccountSelect(account.id)}
                className="card card-interactive flex flex-col justify-center min-h-[140px] transition-all duration-200"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAccountSelect(account.id);
                  }
                }}
                aria-label={`View ${account.name} account details`}
              >
                {/* Account Header */}
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
                      account.monthlyBalance >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {account.monthlyBalance >= 0 ? '+' : ''}
                      {formatCurrency(account.monthlyBalance, account.currency)}
                    </p>
                    <p className="text-xs text-muted">
                      {account.transactionCount} transactions
                    </p>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-muted mb-1">Income</p>
                      <p className="font-semibold text-success">
                        +{formatCurrency(account.monthlyIncome, account.currency)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted mb-1">Expenses</p>
                      <p className="font-semibold text-error">
                        -{formatCurrency(account.monthlyExpenses, account.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyAccountsList;