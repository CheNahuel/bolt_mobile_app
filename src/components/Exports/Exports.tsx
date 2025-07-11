import React from 'react';
import { Download, FileText, Share } from 'lucide-react';
import { Account, Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/helpers';
import Header from '../Layout/Header';

interface ExportsProps {
  accounts: Account[];
  transactions: Transaction[];
}

const Exports: React.FC<ExportsProps> = ({ accounts, transactions }) => {
  const generateCSV = () => {
    const headers = ['Date', 'Account', 'Type', 'Category', 'Description', 'Amount', 'Currency'];
    const rows = transactions.map(transaction => {
      const account = accounts.find(a => a.id === transaction.accountId);
      return [
        formatDate(transaction.date),
        account?.name || 'Unknown',
        transaction.type,
        transaction.category,
        transaction.description || '',
        transaction.amount.toString(),
        account?.currency || 'USD'
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const reportContent = `
EXPENSE TRACKER REPORT
Generated on: ${formatDate(new Date())}

SUMMARY
=======
Total Accounts: ${accounts.length}
Total Transactions: ${transactions.length}
Total Income: $${totalIncome.toLocaleString()}
Total Expenses: $${totalExpenses.toLocaleString()}
Net Balance: $${(totalIncome - totalExpenses).toLocaleString()}

ACCOUNTS
========
${accounts.map(account => {
  const accountTransactions = transactions.filter(t => t.accountId === account.id);
  const balance = accountTransactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
  
  return `${account.name}: ${formatCurrency(balance, account.currency)}`;
}).join('\n')}

RECENT TRANSACTIONS
==================
${transactions
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 20)
  .map(t => {
    const account = accounts.find(a => a.id === t.accountId);
    return `${formatDate(t.date)} | ${account?.name} | ${t.type.toUpperCase()} | ${t.category} | $${t.amount}`;
  }).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const shareData = async () => {
    const summary = `My Expense Tracker Summary:
• ${accounts.length} accounts
• ${transactions.length} transactions
• Total Income: $${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
• Total Expenses: $${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Expense Tracker Summary',
          text: summary,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(summary);
        alert('Summary copied to clipboard!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Exports" />
      
      <div className="flex-1 pb-20">
        <div className="container py-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Accounts</span>
                <span className="font-medium text-right">{accounts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions</span>
                <span className="font-medium text-right">{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Income</span>
                <span className="font-medium text-green-600 text-right">
                  {formatCurrency(totalIncome, 'USD')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Expenses</span>
                <span className="font-medium text-red-600 text-right">
                  {formatCurrency(totalExpenses, 'USD')}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Net Balance</span>
                  <span className={`font-bold ${
                    totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'
                  } text-right`}>
                    {formatCurrency(totalIncome - totalExpenses, 'USD')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Export Data</h2>
            <div className="space-y-3">
              <button
                onClick={generateCSV}
                disabled={transactions.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <Download size={20} />
                <span>Download CSV</span>
              </button>
              
              <button
                onClick={generateReport}
                disabled={transactions.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <FileText size={20} />
                <span>Generate Report</span>
              </button>
              
              <button
                onClick={shareData}
                disabled={transactions.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <Share size={20} />
                <span>Share Summary</span>
              </button>
            </div>
          </div>

          {transactions.length === 0 && (
            <div className="text-center p-8">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-gray-600">
                No data to export. Add some transactions first.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Exports;