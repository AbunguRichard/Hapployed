import React, { useState } from 'react';
import { Wallet, DollarSign, Clock, TrendingUp, CreditCard, Receipt, FileText, Send, ArrowDownCircle } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import { toast } from 'sonner';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('transactions');

  const transactions = [
    {
      id: 1,
      type: 'earnings',
      title: 'Kitchen Faucet Repair',
      client: 'Michael T.',
      amount: 120.00,
      date: 'Today, 10:24 AM',
      positive: true
    },
    {
      id: 2,
      type: 'withdrawal',
      title: 'Withdrawal to Bank',
      client: 'Transfer to Chase •• 4582',
      amount: 500.00,
      date: 'Jun 12, 2023',
      positive: false
    },
    {
      id: 3,
      type: 'earnings',
      title: 'Office Cleaning',
      client: 'Smith Corp',
      amount: 250.00,
      date: 'Jun 10, 2023',
      positive: true
    },
    {
      id: 4,
      type: 'pending',
      title: 'Furniture Assembly',
      client: 'Pending - completes Jun 15',
      amount: 85.00,
      date: 'Jun 8, 2023',
      positive: null
    }
  ];

  const paymentMethods = [
    { id: 1, type: 'PayPal', detail: 'user@example.com', isDefault: true, icon: 'paypal' },
    { id: 2, type: 'Bank Account', detail: 'Chase •• 4582', isDefault: false, icon: 'bank' },
    { id: 3, type: 'Visa Debit', detail: '•••• 4242', isDefault: false, icon: 'card' }
  ];

  const handleWithdraw = () => {
    toast.info('Withdrawal feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Billing & Payments</h1>
          </div>
          <p className="text-purple-100">Manage your earnings, withdrawals, and payment methods</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Available Balance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Available Balance</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-4">$1,425.50</div>
            <button
              onClick={handleWithdraw}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Withdraw Funds
            </button>
          </div>

          {/* Pending Clearance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <Clock className="w-4 h-4" />
              <span>Pending Clearance</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-4">$350.00</div>
            <p className="text-sm text-gray-600">Funds from completed gigs under review</p>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Total Earned</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-4">$4,280.75</div>
            <p className="text-sm text-gray-600">All-time earnings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'transactions'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'payment-methods'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payment Methods
            </button>
            <button
              onClick={() => setActiveTab('tax-documents')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'tax-documents'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tax Documents
            </button>
          </div>

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                </div>
                <button className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === 'earnings'
                            ? 'bg-green-100'
                            : transaction.type === 'withdrawal'
                            ? 'bg-blue-100'
                            : 'bg-orange-100'
                        }`}
                      >
                        {transaction.type === 'earnings' ? (
                          <DollarSign className="w-6 h-6 text-green-600" />
                        ) : transaction.type === 'withdrawal' ? (
                          <Send className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Clock className="w-6 h-6 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{transaction.title}</h4>
                        <p className="text-sm text-gray-600">{transaction.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          transaction.positive
                            ? 'text-green-600'
                            : transaction.positive === false
                            ? 'text-red-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {transaction.positive ? '+' : transaction.positive === false ? '-' : ''} ${transaction.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment-methods' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Add New Method
                </button>
              </div>

              <div className="grid gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{method.type}</h4>
                      <p className="text-sm text-gray-600">{method.detail}</p>
                    </div>
                    {method.isDefault && (
                      <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tax Documents Tab */}
          {activeTab === 'tax-documents' && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Tax Documents</h2>
              </div>

              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tax documents yet</h3>
                <p className="text-gray-600">Your tax forms will appear here at the end of the year</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
