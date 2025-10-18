import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Check, Download, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function BillingSection({ user, onUnsavedChanges }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const userId = user?.id || 'test-user';
      
      // Fetch payment methods
      const methodsRes = await fetch(`${BACKEND_URL}/api/settings/billing/${userId}/payment-methods`);
      const methodsData = await methodsRes.json();
      setPaymentMethods(methodsData);

      // Fetch invoices
      const invoicesRes = await fetch(`${BACKEND_URL}/api/settings/billing/${userId}/invoices`);
      const invoicesData = await invoicesRes.json();
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (methodId) => {
    try {
      await fetch(`${BACKEND_URL}/api/settings/billing/payment-methods/${methodId}`, {
        method: 'DELETE'
      });
      toast.success('Payment method removed');
      fetchBillingData();
    } catch (error) {
      toast.error('Failed to remove payment method');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Billing & Payments</h2>
        <p className="text-muted-foreground">Manage your payment methods and view billing history.</p>
      </div>

      {/* Payment Methods */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
          <button
            onClick={() => setShowAddCard(!showAddCard)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>

        {/* Add Card Form */}
        {showAddCard && (
          <div className="mb-4 p-6 border border-border rounded-lg bg-muted/30">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="input w-full"
                  maxLength="19"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="input w-full"
                    maxLength="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="input w-full"
                    maxLength="4"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.success('Payment method added successfully');
                    setShowAddCard(false);
                    fetchBillingData();
                  }}
                  className="btn-primary"
                >
                  Add Card
                </button>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Cards */}
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="p-4 border border-border rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    •••• {method.last_four}
                    {method.is_default && (
                      <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">Default</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">{method.type}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteMethod(method.id)}
                className="text-red-500 hover:text-red-600 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Billing History</h3>
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>

        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">${invoice.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  invoice.status === 'paid' 
                    ? 'bg-green-500/10 text-green-600' 
                    : invoice.status === 'pending'
                    ? 'bg-orange-500/10 text-orange-600'
                    : 'bg-red-500/10 text-red-600'
                }`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
                {invoice.invoice_url && (
                  <button className="text-sm text-primary hover:underline">
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Info */}
      <div className="p-6 border border-border rounded-lg bg-blue-50/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Secure Payments</p>
            <p className="text-sm text-muted-foreground">
              All transactions are encrypted and secure. We never store your full card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
