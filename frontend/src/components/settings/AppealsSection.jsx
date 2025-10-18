import React, { useState, useEffect } from 'react';
import { AlertCircle, Send, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const APPEAL_TYPES = [
  { value: 'account_suspension', label: 'Account Suspension' },
  { value: 'payment_dispute', label: 'Payment Dispute' },
  { value: 'service_quality', label: 'Service Quality Issue' },
  { value: 'other', label: 'Other' }
];

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Pending' },
  under_review: { icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Under Review' },
  resolved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Resolved' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected' }
};

export default function AppealsSection({ user, onUnsavedChanges }) {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppeal, setShowNewAppeal] = useState(false);
  const [newAppeal, setNewAppeal] = useState({
    type: '',
    subject: '',
    description: ''
  });

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      const userId = user?.id || 'test-user';
      const res = await fetch(`${BACKEND_URL}/api/settings/appeals/${userId}`);
      const data = await res.json();
      setAppeals(data);
    } catch (error) {
      console.error('Error fetching appeals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppeal = async () => {
    if (!newAppeal.type || !newAppeal.subject || !newAppeal.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const userId = user?.id || 'test-user';
      await fetch(`${BACKEND_URL}/api/settings/appeals/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppeal)
      });
      toast.success('Appeal submitted successfully!');
      setShowNewAppeal(false);
      setNewAppeal({ type: '', subject: '', description: '' });
      fetchAppeals();
    } catch (error) {
      toast.error('Failed to submit appeal');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Appeals Tracker</h2>
        <p className="text-muted-foreground">Submit and track appeals for account or payment issues.</p>
      </div>

      {/* New Appeal Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNewAppeal(!showNewAppeal)}
          className="btn-primary flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Submit New Appeal
        </button>
      </div>

      {/* New Appeal Form */}
      {showNewAppeal && (
        <div className="p-6 border-2 border-primary/30 rounded-lg bg-primary/5">
          <h3 className="font-semibold text-foreground mb-4">New Appeal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Appeal Type</label>
              <select
                value={newAppeal.type}
                onChange={(e) => setNewAppeal({ ...newAppeal, type: e.target.value })}
                className="input w-full"
              >
                <option value="">Select type</option>
                {APPEAL_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
              <input
                type="text"
                value={newAppeal.subject}
                onChange={(e) => setNewAppeal({ ...newAppeal, subject: e.target.value })}
                placeholder="Brief description of the issue"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <textarea
                value={newAppeal.description}
                onChange={(e) => setNewAppeal({ ...newAppeal, description: e.target.value })}
                placeholder="Provide detailed information about your appeal..."
                className="input w-full h-32 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSubmitAppeal} className="btn-primary">
                Submit Appeal
              </button>
              <button
                onClick={() => setShowNewAppeal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeals List */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Your Appeals ({appeals.length})</h3>
        
        {appeals.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No appeals submitted yet</p>
            <p className="text-sm text-muted-foreground">Submit an appeal if you have any issues or disputes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appeals.map((appeal) => {
              const statusConfig = STATUS_CONFIG[appeal.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={appeal.id} className="p-6 border border-border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">{appeal.subject}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {APPEAL_TYPES.find(t => t.value === appeal.type)?.label}
                      </p>
                      <p className="text-sm text-foreground">{appeal.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                    <span>Submitted {new Date(appeal.created_at).toLocaleDateString()}</span>
                    {appeal.resolution && (
                      <span className="text-green-600 font-medium">Resolution: {appeal.resolution}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-6 border border-border rounded-lg bg-yellow-50/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Appeal Response Time</p>
            <p className="text-sm text-muted-foreground">
              Our team typically reviews appeals within 2-3 business days. You'll receive email updates on your appeal status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
