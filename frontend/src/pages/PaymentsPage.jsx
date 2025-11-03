import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { ArrowLeft, CreditCard, Plus, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRecruiter = user?.currentMode === 'employer';
  const [activeTab, setActiveTab] = useState('overview');

  const handleReturn = () => {
    if (isRecruiter) {
      navigate('/recruiter-dashboard');
    } else {
      navigate('/epic-worker-dashboard');
    }
  };

  // Mock data - in production, this would come from API
  const paymentMethods = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '5555', expiry: '08/26', isDefault: false }
  ];

  const transactions = [
    {
      id: 1,
      date: '2024-11-01',
      description: 'Payment for UX Designer - John Doe',
      amount: 2500,
      status: 'completed',
      type: 'debit'
    },
    {
      id: 2,
      date: '2024-10-28',
      description: 'Earnings from Website Redesign Project',
      amount: 1800,
      status: 'completed',
      type: 'credit'
    },
    {
      id: 3,
      date: '2024-10-25',
      description: 'Platform Service Fee',
      amount: 150,
      status: 'pending',
      type: 'debit'
    },
    {
      id: 4,
      date: '2024-10-20',
      description: 'Payment for Social Media Manager',
      amount: 3200,
      status: 'completed',
      type: 'debit'
    }
  ];

  const balance = {
    available: 5420.00,
    pending: 1250.00,
    lifetime: 48750.00
  };

  return (
    <div style={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Return Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReturn}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Payments & Billing</h1>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add Payment Method</span>
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <BalanceCard title="Available Balance" amount={balance.available} icon="💰" color="green" />
          <BalanceCard title="Pending" amount={balance.pending} icon="⏳" color="yellow" />
          <BalanceCard title="Lifetime Earnings" amount={balance.lifetime} icon="📈" color="purple" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <TabButton label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
              <TabButton label="Payment Methods" active={activeTab === 'methods'} onClick={() => setActiveTab('methods')} />
              <TabButton label="Invoices" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                  <button className="text-purple-600 hover:text-purple-700 font-medium">View All</button>
                </div>
                <div className="space-y-3">
                  {transactions.slice(0, 3).map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">All Transactions</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="font-medium">Export CSV</span>
                  </button>
                </div>
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}

            {activeTab === 'methods' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h2>
                {paymentMethods.map((method) => (
                  <PaymentMethodCard key={method.id} method={method} />
                ))}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Yet</h3>
                <p className="text-gray-600">Your invoices and receipts will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ title, amount, icon, color }) {
  const colorClasses = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <Eye className="w-5 h-5 text-gray-400 cursor-pointer" />
      </div>
      <div className={`text-3xl font-bold mb-1 ${colorClasses[color]}`}>
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-4 border-b-2 font-medium transition-colors ${
        active
          ? 'border-purple-600 text-purple-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

function TransactionItem({ transaction }) {
  const statusIcons = {
    completed: <CheckCircle className="w-5 h-5 text-green-600" />,
    pending: <Clock className="w-5 h-5 text-yellow-600" />,
    failed: <AlertCircle className="w-5 h-5 text-red-600" />
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        {statusIcons[transaction.status]}
        <div>
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold text-lg ${
          transaction.type === 'credit' ? 'text-green-600' : 'text-gray-900'
        }`}>
          {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 capitalize">{transaction.status}</p>
      </div>
    </div>
  );
}

function PaymentMethodCard({ method }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-4">
        <CreditCard className="w-8 h-8 text-purple-600" />
        <div>
          <p className="font-medium text-gray-900">{method.type} •••• {method.last4}</p>
          <p className="text-sm text-gray-600">Expires {method.expiry}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {method.isDefault && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Default
          </span>
        )}
        <button className="text-purple-600 hover:text-purple-700 font-medium">Edit</button>
      </div>
    </div>
  );
}