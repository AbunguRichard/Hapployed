import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function TaxInfoSection({ user, onUnsavedChanges }) {
  const [country, setCountry] = useState('US');
  const [taxProfile, setTaxProfile] = useState({
    status: 'incomplete', // incomplete, submitted, verified
    type: 'W-9', // W-9, W-8BEN
    tin: '',
    legalName: '',
    address: ''
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tax Information</h2>
        <p className="text-muted-foreground">Manage your tax documents and compliance information.</p>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg flex items-start gap-3 ${
        taxProfile.status === 'verified' ? 'bg-green-500/10 border border-green-500/30' :
        taxProfile.status === 'submitted' ? 'bg-blue-500/10 border border-blue-500/30' :
        'bg-orange-500/10 border border-orange-500/30'
      }`}>
        {taxProfile.status === 'verified' ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> :
         taxProfile.status === 'submitted' ? <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" /> :
         <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />}
        <div>
          <p className="font-semibold text-foreground">
            {taxProfile.status === 'verified' ? 'Tax Information Verified' :
             taxProfile.status === 'submitted' ? 'Under Review' :
             'Tax Information Required'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {taxProfile.status === 'incomplete' && 'Complete your tax information to receive payouts'}
            {taxProfile.status === 'submitted' && 'Your documents are being reviewed. This usually takes 1-2 business days.'}
            {taxProfile.status === 'verified' && 'Your tax information is complete and verified.'}
          </p>
        </div>
      </div>

      {/* Country Selection */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Country</label>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="input w-full">
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* US Tax Forms */}
      {country === 'US' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Form Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border-2 border-primary bg-primary/5 rounded-lg text-left">
                <p className="font-semibold text-foreground mb-1">W-9</p>
                <p className="text-xs text-muted-foreground">U.S. Person (Citizen or Resident)</p>
              </button>
              <button className="p-4 border border-border rounded-lg text-left hover:border-primary transition-colors">
                <p className="font-semibold text-foreground mb-1">W-8BEN</p>
                <p className="text-xs text-muted-foreground">Foreign Individual</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Legal Name</label>
            <input type="text" className="input w-full" placeholder="Full legal name" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Tax Identification Number (TIN)</label>
            <input type="text" className="input w-full" placeholder="SSN or EIN" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Business Address</label>
            <textarea className="input w-full" rows="3" placeholder="Street, City, State, ZIP"></textarea>
          </div>

          <div className="flex gap-3">
            <button className="btn-primary">Submit Tax Information</button>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Form
            </button>
          </div>
        </div>
      )}

      {/* Tax Documents */}
      {taxProfile.status === 'verified' && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Tax Documents</h3>
          <div className="space-y-3">
            <div className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">2024 1099-K Form</p>
                  <p className="text-sm text-muted-foreground">Generated Jan 31, 2024</p>
                </div>
              </div>
              <button className="btn-secondary text-sm">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}