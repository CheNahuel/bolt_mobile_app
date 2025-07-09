import React from 'react';
import { Trash2, Database, Info } from 'lucide-react';
import { storage } from '../../utils/storage';
import Header from '../Layout/Header';

interface SettingsProps {
  onDataClear: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onDataClear }) => {
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      storage.clearAll();
      onDataClear();
      alert('All data has been cleared.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Settings" />
      
      <div className="flex-1 pb-20">
        <div className="container py-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* App Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Info size={24} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-field">About</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="content-boundary">Simple Expense & Income Tracker</p>
              <p className="content-boundary">Version 1.0.0</p>
              <p className="content-boundary">Offline-first personal finance tracking</p>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Database size={24} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-field">Data Management</h2>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1 text-field">Local Storage</h3>
                <p className="text-sm text-gray-600 content-boundary">
                  All your data is stored locally on your device. No data is sent to external servers.
                </p>
              </div>
              
              <button
                onClick={handleClearData}
                className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <Trash2 size={20} />
                <span className="text-field">Clear All Data</span>
              </button>
              
              <p className="text-xs text-gray-500 text-center content-boundary">
                This will permanently delete all accounts, transactions, and settings.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-field">Features</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 content-boundary">Offline-first operation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 content-boundary">Multiple accounts support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 content-boundary">Expense & income tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 content-boundary">Visual charts & reports</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 content-boundary">Data export (CSV, reports)</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;