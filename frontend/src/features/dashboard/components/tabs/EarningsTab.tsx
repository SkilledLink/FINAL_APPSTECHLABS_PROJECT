import React, { useState } from 'react';
import { Wallet, TrendingUp, Download, ArrowUpRight, ArrowDownRight, Clock, Briefcase } from 'lucide-react';

interface Transaction {
  id: number;
  client: string;
  service: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'payment' | 'withdrawal';
}

export const EarningsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'month' | 'year' | 'all'>('month');

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      client: 'Marie-Claire Ngo',
      service: 'Electrical Installation',
      amount: 250000,
      date: '2026-09-01',
      status: 'completed',
      type: 'payment'
    },
    {
      id: 2,
      client: 'Paul Ekambi',
      service: 'Solar Panel Installation',
      amount: 850000,
      date: '2026-08-28',
      status: 'pending',
      type: 'payment'
    },
    {
      id: 3,
      client: 'Fatima Aboubakar',
      service: 'Electrical Repairs',
      amount: 75000,
      date: '2026-08-25',
      status: 'completed',
      type: 'payment'
    },
    {
      id: 4,
      client: 'David Tchoumi',
      service: 'Home Automation',
      amount: 450000,
      date: '2026-08-20',
      status: 'failed',
      type: 'payment'
    },
    {
      id: 5,
      client: 'Solange Mbia',
      service: 'Electrical Maintenance',
      amount: 180000,
      date: '2026-08-18',
      status: 'completed',
      type: 'payment'
    }
  ];

  const totalEarnings = mockTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingEarnings = mockTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    return type === 'payment' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownRight className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
          <p className="text-gray-600 mt-1">Track your earnings and payments</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-3xl font-bold text-green-600">{totalEarnings.toLocaleString()} CFA</p>
          <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            +18.7% this month
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingEarnings.toLocaleString()} CFA</p>
          <span className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            Awaiting confirmation
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-3xl font-bold text-blue-600">{mockTransactions.filter(t => t.status === 'completed').length}</p>
          <span className="text-xs text-blue-600 flex items-center gap-1 mt-1">
            <Briefcase className="w-3 h-3" />
            Completed projects
          </span>
        </div>
      </div>

      {/* Monthly Earnings Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Earnings Overview</h4>
          <div className="flex gap-2">
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Year
            </button>
            <button 
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All
            </button>
          </div>
        </div>
        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Wallet className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Earnings chart coming soon</p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Recent Transactions</h4>
          <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {mockTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${transaction.type === 'payment' ? 'bg-green-50' : 'bg-red-50'}`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{transaction.client}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{transaction.service}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">{transaction.amount.toLocaleString()} CFA</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
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