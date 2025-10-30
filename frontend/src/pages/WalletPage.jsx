import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, DollarSign, CreditCard, TrendingUp, Shield, Clock } from 'lucide-react';

export default function WalletPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
            <Wallet className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">💰 Wallet</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your earnings, track payments, and withdraw funds with ease
          </p>
        </div>

        {/* Balance Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">Available Balance</span>
            </div>
            <div className="text-4xl font-bold mb-4">$0.00</div>
            <button className="w-full px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 font-semibold">
              Withdraw Funds
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-4">$0.00</div>
            <div className="text-sm text-gray-600">In escrow / processing</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Total Earned</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-4">$0.00</div>
            <div className="text-sm text-gray-600">All-time earnings</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Multiple Payment Methods</h3>
            <p className="text-gray-600">Bank transfer, PayPal, crypto, and more withdrawal options</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Secure Transactions</h3>
            <p className="text-gray-600">Bank-level encryption and fraud protection for all transactions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Fast Withdrawals</h3>
            <p className="text-gray-600">Get your money quickly with same-day processing options</p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-xl mb-8 text-emerald-100">
            We're building a comprehensive wallet system to manage all your earnings in one place
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/epic-worker-dashboard')}
              className="px-6 py-3 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 font-semibold"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => navigate('/epic-worker-dashboard')}
              className="px-6 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 font-semibold"
            >
              View Earnings
            </button>
          </div>
        </div>

        {/* Transaction History Preview */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold mb-6">Recent Transactions</h3>
          <div className="text-center py-12 text-gray-500">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm mt-2">Your payment history will appear here</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold mb-6">Payment Methods</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="text-sm text-gray-600 mb-2">Bank Account</div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + Add Account
              </button>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="text-sm text-gray-600 mb-2">PayPal</div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + Connect PayPal
              </button>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="text-sm text-gray-600 mb-2">Crypto Wallet</div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + Add Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
