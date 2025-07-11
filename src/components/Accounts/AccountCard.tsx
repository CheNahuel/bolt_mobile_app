import React from 'react';
import Decimal from 'decimal.js';
import { Account, Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface AccountCardProps {
  account: Account;
  monthlyIncome: string;
  monthlyExpenses: string;
  monthlyBalance: string;
  transactionCount: number;
  onClick: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  monthlyIncome,
  monthlyExpenses,
  monthlyBalance,
  transactionCount,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="card card-interactive flex flex-col justify-center min-h-[140px]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View ${account.name} account details`}
    >
      {/* Account Header */}
      <div className="flex items-center justify-between space-x-4 mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
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
            new Decimal(monthlyBalance).gte(0) ? 'text-success' : 'text-error'
          }`}>
            {new Decimal(monthlyBalance).gte(0) ? '+' : ''}
            {formatCurrency(monthlyBalance, account.currency)}
          </p>
          <p className="text-xs text-muted">
            {transactionCount} transactions
          </p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="border-t border-gray-200 pt-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted mb-1">Income</p>
            <p className="font-semibold text-success">
              +{formatCurrency(monthlyIncome, account.currency)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted mb-1">Expenses</p>
            <p className="font-semibold text-error">
              -{formatCurrency(monthlyExpenses, account.currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;