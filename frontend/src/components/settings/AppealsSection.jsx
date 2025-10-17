import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Paperclip, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AppealsSection({ user, onUnsavedChanges }) {
  const [appeals, setAppeals] = useState([
    {
      id: 'AP-1234',
      type: 'Payment Hold',
      status: 'Under Review',
      created: 'Oct 15, 2024',
      lastUpdate: '2 hours ago',
      slaDue: 'Oct 20, 2024',
      description: 'Payment held for project #5678'
    },
    {
      id: 'AP-1233',
      type: 'Account Suspension',
      status: 'Resolved',
      created: 'Oct 10, 2024',
      lastUpdate: 'Oct 12, 2024',
      slaDue: 'Oct 15, 2024',
      description: 'Account temporarily suspended for review'
    }
  ]);

  const [showNewAppeal, setShowNewAppeal] = useState(false);

  const getStatusColor = (status) => {
    if (status === 'Resolved') return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (status === 'Under Review') return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
  };

  const getStatusIcon = (status) => {
    if (status === 'Resolved') return CheckCircle;
    if (status === 'Under Review') return Clock;
    return AlertCircle;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Appeals Tracker</h2>
          <p className="text-muted-foreground">Track disputes, moderation issues, and support cases.</p>
        </div>
        <button onClick={() => setShowNewAppeal(!showNewAppeal)} className="btn-primary">
          Submit Appeal
        </button>
      </div>

      {/* New Appeal Form */}
      {showNewAppeal && (
        <div className="p-6 border-2 border-primary/30 bg-primary/5 rounded-lg">
          <h3 className="font-semibold text-foreground mb-4">Submit New Appeal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Appeal Type</label>
              <select className="input w-full">
                <option>Payment Dispute</option>
                <option>Account Suspension</option>
                <option>Rating Review</option>
                <option>Payment Hold</option>
                <option>Content Moderation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <textarea className="input w-full" rows="4" placeholder="Describe your issue in detail..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Attachments</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Paperclip className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload evidence (images, documents)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn-primary flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit Appeal
              </button>
              <button onClick={() => setShowNewAppeal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Appeals List */}
      <div className="space-y-4">
        {appeals.map(appeal => {
          const StatusIcon = getStatusIcon(appeal.status);
          return (
            <div key={appeal.id} className="p-6 border border-border rounded-lg hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(appeal.status)}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-foreground">{appeal.id}</h3>
                      <span className={`badge ${getStatusColor(appeal.status)} text-xs`}>{appeal.status}</span>
                    </div>
                    <p className="text-sm text-foreground font-medium mb-1">{appeal.type}</p>
                    <p className="text-sm text-muted-foreground">{appeal.description}</p>
                  </div>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border text-sm">
                <div className="flex gap-6">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">{appeal.created}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Update</p>
                    <p className="font-medium text-foreground">{appeal.lastUpdate}</p>
                  </div>
                  {appeal.status === 'Under Review' && (
                    <div>
                      <p className="text-muted-foreground">SLA Due</p>
                      <p className="font-medium text-orange-500">{appeal.slaDue}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-foreground">
          <strong>Need help?</strong> Our support team reviews appeals within 48 hours. You'll receive email updates as your case progresses.
        </p>
      </div>
    </div>
  );
}