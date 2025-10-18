import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingSection({ user, onUnsavedChanges }) {
  const [activeTab, setActiveTab] = useState('payment-methods');
  
  const paymentMethods = [
    { id: 1, type: 'card', brand: 'Visa', last4: '4242', exp: '12/25', isPrimary: true, verified: true },
    { id: 2, type: 'bank', brand: 'Chase', last4: '5678', isPrimary: false, verified: true }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Billing & Payments</h2>
        <p className="text-muted-foreground">Manage payment methods, payouts, and invoices.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['payment-methods', 'payout-methods', 'invoices'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 font-medium transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Payment Methods */}
      {activeTab === 'payment-methods' && (
        <div className="space-y-4">
          {paymentMethods.map(method => (
            <div key={method.id} className="p-4 border border-border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{method.brand} •••• {method.last4}</p>
                    {method.isPrimary && <span className="badge badge-purple text-xs">Primary</span>}
                    {method.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  {method.type === 'card' && <p className="text-sm text-muted-foreground">Expires {method.exp}</p>}
                </div>
              </div>
              <button className="text-red-500 hover:text-red-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>
      )}

      {/* Payout Methods */}
      {activeTab === 'payout-methods' && (
        <div className="space-y-4">
          <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-2">No payout methods yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add a bank account or PayPal to receive payments</p>
            <button className="btn-primary">Add Payout Method</button>
          </div>
        </div>
      )}

      {/* Invoices */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <p className="text-muted-foreground">No invoices available yet.</p>
        </div>
      )}
    </div>
  );
}