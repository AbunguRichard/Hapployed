import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet as WalletIcon, DollarSign, CreditCard, TrendingUp, Shield, Clock, ArrowDown, ArrowUp, Check, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function WalletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Cashout form state
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [cashoutType, setCashoutType] = useState('instant');
  const [fees, setFees] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Savings state
  const [savingsAmount, setSavingsAmount] = useState('');
  
  // Credit state
  const [creditAmount, setCreditAmount] = useState('');
  const [creditPurpose, setCreditPurpose] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/wallet/`);
      if (response.ok) {
        const data = await response.json();
        setWallet(data.data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFees = async (amount, method, instant) => {
    if (!amount || amount <= 0) {
      setFees(null);
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/wallet/calculate-fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          method,
          instant
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFees(data.data);
      }
    } catch (error) {
      console.error('Error calculating fees:', error);
    }
  };

  const handleCashout = async () => {
    if (!cashoutAmount || parseFloat(cashoutAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(cashoutAmount) > wallet.balance.available) {
      alert('Insufficient balance');
      return;
    }

    try {
      setProcessing(true);
      const endpoint = cashoutType === 'instant' 
        ? `${BACKEND_URL}/api/wallet/cashout/instant`
        : `${BACKEND_URL}/api/wallet/cashout/standard`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(cashoutAmount),
          method: selectedMethod,
          method_details: {
            bank_name: 'Chase',
            account_last4: '1234'
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Cashout successful! You will receive $${data.data.net_amount}`);
        setCashoutAmount('');
        setFees(null);
        fetchWallet();
      } else {
        alert(`❌ ${data.message || 'Cashout failed'}`);
      }
    } catch (error) {
      alert(`❌ Cashout failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const setupSavingsAccount = async () => {
    const initialAmount = parseFloat(savingsAmount) || 0;
    
    if (initialAmount > 0 && initialAmount > wallet.balance.available) {
      alert('Insufficient balance');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/wallet/savings/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial_amount: initialAmount })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Savings account setup successfully!');
        setSavingsAmount('');
        fetchWallet();
      } else {
        alert(`❌ ${data.message || 'Setup failed'}`);
      }
    } catch (error) {
      alert(`❌ Setup failed: ${error.message}`);
    }
  };

  const requestCredit = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!creditPurpose) {
      alert('Please specify purpose');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/wallet/credit/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(creditAmount),
          purpose: creditPurpose
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Credit approved! Available credit: $${data.data.available_credit}`);
        setCreditAmount('');
        setCreditPurpose('');
        fetchWallet();
      } else {
        alert(`❌ ${data.message || 'Credit request failed'}`);
      }
    } catch (error) {
      alert(`❌ Credit request failed: ${error.message}`);
    }
  };

  if (loading || !wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header with Balance Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <WalletIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">💰 Wallet</h1>
              <p className="text-gray-600">Manage your earnings and payments</p>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Available Balance</span>
              </div>
              <div className="text-4xl font-bold mb-4">${wallet.balance.available.toFixed(2)}</div>
              <button 
                onClick={() => setActiveTab('cashout')}
                className="w-full px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 font-semibold text-sm"
              >
                Withdraw Funds
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">${wallet.balance.pending.toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-2">In processing</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Savings</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">${wallet.financial_products.savings.balance.toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-2">{wallet.financial_products.savings.interest_rate}% APY</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-medium">Total Earned</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">${wallet.stats.total_earned.toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-2">All-time</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {['overview', 'cashout', 'savings', 'credit', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Earned</div>
                    <div className="text-2xl font-bold text-gray-900">${wallet.stats.total_earned.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Withdrawn</div>
                    <div className="text-2xl font-bold text-gray-900">${wallet.stats.total_withdrawn.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Fees</div>
                    <div className="text-2xl font-bold text-gray-900">${wallet.stats.total_fees.toFixed(2)}</div>
                  </div>
                </div>

                {!wallet.financial_products.savings.enabled && (
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">Start Earning Interest! 🚀</h3>
                    <p className="text-purple-100 mb-4">Get {wallet.financial_products.savings.interest_rate}% APY on your savings</p>
                    <button 
                      onClick={() => setActiveTab('savings')}
                      className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-semibold"
                    >
                      Setup Savings Account
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cashout Tab */}
            {activeTab === 'cashout' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-600 transition-colors">
                    <input
                      type="radio"
                      value="instant"
                      checked={cashoutType === 'instant'}
                      onChange={(e) => {
                        setCashoutType(e.target.value);
                        if (cashoutAmount) calculateFees(cashoutAmount, selectedMethod, true);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold">⚡ Instant Cashout</div>
                      <div className="text-sm text-gray-600">1.5-3.5% fee • Instant transfer</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-600 transition-colors">
                    <input
                      type="radio"
                      value="standard"
                      checked={cashoutType === 'standard'}
                      onChange={(e) => {
                        setCashoutType(e.target.value);
                        if (cashoutAmount) calculateFees(cashoutAmount, selectedMethod, false);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold">🕐 Standard Cashout</div>
                      <div className="text-sm text-gray-600">Free for Pro users • 2-3 business days</div>
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Cash Out</label>
                    <input
                      type="number"
                      value={cashoutAmount}
                      onChange={(e) => {
                        setCashoutAmount(e.target.value);
                        calculateFees(e.target.value, selectedMethod, cashoutType === 'instant');
                      }}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <div className="text-sm text-gray-600 mt-1">Available: ${wallet.balance.available.toFixed(2)}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={selectedMethod}
                      onChange={(e) => {
                        setSelectedMethod(e.target.value);
                        if (cashoutAmount) calculateFees(cashoutAmount, e.target.value, cashoutType === 'instant');
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="credit_card">Credit/Debit Card</option>
                    </select>
                  </div>

                  {fees && cashoutAmount && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Fee Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-semibold">${parseFloat(cashoutAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fee ({fees.rate}%):</span>
                          <span className="font-semibold text-red-600">-${fees.fee_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-300">
                          <span className="font-bold">You Receive:</span>
                          <span className="font-bold text-green-600 text-xl">${fees.net_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCashout}
                    disabled={processing || !cashoutAmount || parseFloat(cashoutAmount) > wallet.balance.available}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    {processing ? 'Processing...' : 'Process Cashout'}
                  </button>
                </div>
              </div>
            )}

            {/* Savings Tab */}
            {activeTab === 'savings' && (
              <div className="space-y-6">
                {wallet.financial_products.savings.enabled ? (
                  <>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">Your Savings Account</h3>
                      <div className="text-5xl font-bold mb-2">${wallet.financial_products.savings.balance.toFixed(2)}</div>
                      <p className="text-blue-100">Earning {wallet.financial_products.savings.interest_rate}% APY</p>
                      <div className="mt-4 pt-4 border-t border-blue-400">
                        <div className="text-sm">Estimated monthly interest:</div>
                        <div className="text-2xl font-bold">
                          ${((wallet.financial_products.savings.balance * wallet.financial_products.savings.interest_rate) / (12 * 100)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold mb-4">How Savings Work</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Interest is calculated and added monthly</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Withdraw anytime without penalties</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>FDIC insured up to $250,000</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-8 text-white text-center">
                      <h3 className="text-3xl font-bold mb-3">Start Earning {wallet.financial_products.savings.interest_rate}% APY! 🎯</h3>
                      <p className="text-purple-100 text-lg mb-6">Turn your idle balance into passive income</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Initial Deposit (Optional)</label>
                      <input
                        type="number"
                        value={savingsAmount}
                        onChange={(e) => setSavingsAmount(e.target.value)}
                        placeholder="Enter amount (or 0 to setup later)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                      <div className="text-sm text-gray-600 mt-1">Available: ${wallet.balance.available.toFixed(2)}</div>
                    </div>

                    <button
                      onClick={setupSavingsAccount}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                    >
                      Setup Savings Account
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Credit Tab */}
            {activeTab === 'credit' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Credit Advance</h3>
                  <p className="text-orange-100 mb-4">Get instant funds based on your earnings history</p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <div className="text-sm opacity-90">Credit Used</div>
                      <div className="text-2xl font-bold">${wallet.financial_products.credit.used.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-90">Interest Rate</div>
                      <div className="text-2xl font-bold">{wallet.financial_products.credit.interest_rate}% APR</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit Amount</label>
                    <input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                    <textarea
                      value={creditPurpose}
                      onChange={(e) => setCreditPurpose(e.target.value)}
                      placeholder="What will you use this credit for?"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={requestCredit}
                    disabled={!creditAmount || !creditPurpose}
                    className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    Request Credit
                  </button>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    <strong>Note:</strong> Credit must be repaid within 30 days. Late fees may apply.
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Transaction History</h3>
                {wallet.transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <WalletIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No transactions yet</p>
                    <p className="text-sm mt-2">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wallet.transactions.slice(-10).reverse().map((transaction, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'cashout' ? 'bg-red-100' : 
                              transaction.type === 'deposit' ? 'bg-green-100' :
                              'bg-blue-100'
                            }`}>
                              {transaction.type === 'cashout' ? <ArrowDown className="w-5 h-5 text-red-600" /> : 
                               transaction.type === 'deposit' ? <ArrowUp className="w-5 h-5 text-green-600" /> :
                               <DollarSign className="w-5 h-5 text-blue-600" />}
                            </div>
                            <div>
                              <div className="font-semibold capitalize">{transaction.type}</div>
                              <div className="text-sm text-gray-600">{transaction.description || 'No description'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              transaction.type === 'cashout' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {transaction.type === 'cashout' ? '-' : '+'}${transaction.amount.toFixed(2)}
                            </div>
                            <div className={`text-sm px-2 py-1 rounded ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {transaction.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                          {transaction.fee && transaction.fee.amount > 0 && (
                            <span className="text-red-600">Fee: ${transaction.fee.amount.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
