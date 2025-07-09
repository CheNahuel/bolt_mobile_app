import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Account, Transaction, Category } from '../../types';
import { formatCurrency } from '../../utils/currency';
import Header from '../Layout/Header';

interface ChartsProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
}

const Charts: React.FC<ChartsProps> = ({ accounts, transactions, categories }) => {
  // Calculate expense breakdown by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = categories.find(c => c.name === transaction.category && c.type === 'expense');
      const key = transaction.category;
      
      if (!acc[key]) {
        acc[key] = {
          name: transaction.category,
          value: 0,
          color: category?.color || '#6b7280',
          icon: category?.icon || '💸',
        };
      }
      acc[key].value += transaction.amount;
      return acc;
    }, {} as Record<string, any>);

  const expenseData = Object.values(expensesByCategory);

  // Calculate monthly trends
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = transaction.date.toISOString().slice(0, 7); // YYYY-MM
    
    if (!acc[month]) {
      acc[month] = { month, expenses: 0, income: 0 };
    }
    
    if (transaction.type === 'expense') {
      acc[month].expenses += transaction.amount;
    } else if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const monthlyTrends = Object.values(monthlyData)
    .sort((a: any, b: any) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Charts" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="heading-3 mb-2">
            No data to display
          </h2>
          <p className="text-secondary">
            Add some transactions to see your spending patterns and trends
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Charts" />
      
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="grid-container">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm text-secondary mb-1">Total Income</h3>
              <p className="text-xl font-bold text-success">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm text-secondary mb-1">Total Expenses</h3>
              <p className="text-xl font-bold text-error">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Expense Breakdown */}
          {expenseData.length > 0 && (
            <div className="card">
              <h3 className="heading-4 mb-4">Expense Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {expenseData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-secondary truncate">
                      {item.icon} {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Trends */}
          {monthlyTrends.length > 1 && (
            <div className="card">
              <h3 className="heading-4 mb-4">Monthly Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value + '-01');
                        return date.toLocaleDateString('en-US', { month: 'short' });
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`,
                        name === 'income' ? 'Income' : 'Expenses'
                      ]}
                      labelFormatter={(value) => {
                        const date = new Date(value + '-01');
                        return date.toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        });
                      }}
                    />
                    <Bar dataKey="income" fill="#22c55e" />
                    <Bar dataKey="expenses" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;