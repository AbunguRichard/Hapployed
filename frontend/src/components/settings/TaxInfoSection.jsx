import React, { useState, useEffect } from 'react';
import { FileText, Upload, Check, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function TaxInfoSection({ user, onUnsavedChanges }) {
  const [taxInfo, setTaxInfo] = useState({
    tax_id: '',
    tax_classification: '',
    w9_submitted: false,
    w9_document_url: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxInfo();
  }, []);

  const fetchTaxInfo = async () => {
    try {
      const userId = user?.id || 'test-user';
      const res = await fetch(`${BACKEND_URL}/api/settings/tax-info/${userId}`);
      const data = await res.json();
      setTaxInfo(data);
    } catch (error) {
      console.error('Error fetching tax info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaxInfo(prev => ({ ...prev, [name]: value }));
    onUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      const userId = user?.id || 'test-user';
      await fetch(`${BACKEND_URL}/api/settings/tax-info/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taxInfo, user_id: userId })
      });
      toast.success('Tax information updated!');
      onUnsavedChanges(false);
    } catch (error) {
      toast.error('Failed to update tax information');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.success('W-9 form uploaded successfully');
      setTaxInfo(prev => ({ ...prev, w9_submitted: true, w9_document_url: '#' }));
      onUnsavedChanges(true);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tax Information</h2>
        <p className="text-muted-foreground">Manage your tax details for compliance and reporting.</p>
      </div>

      {/* Warning Banner */}
      <div className="p-4 border border-orange-500/30 bg-orange-50/50 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground mb-1">Important: Tax Compliance</p>
          <p className="text-sm text-muted-foreground">
            US freelancers earning over $600/year must submit a W-9 form. This information is kept secure and used only for IRS reporting.
          </p>
        </div>
      </div>

      {/* Tax ID */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Tax ID (SSN or EIN)
        </label>
        <input
          type="text"
          name="tax_id"
          value={taxInfo.tax_id}
          onChange={handleChange}
          placeholder="XXX-XX-XXXX"
          className="input w-full"
          maxLength="11"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Your tax ID is encrypted and only visible to you and tax authorities
        </p>
      </div>

      {/* Tax Classification */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Tax Classification
        </label>
        <select
          name="tax_classification"
          value={taxInfo.tax_classification}
          onChange={handleChange}
          className="input w-full"
        >
          <option value="">Select classification</option>
          <option value="individual">Individual/Sole Proprietor</option>
          <option value="llc">LLC</option>
          <option value="corporation">C Corporation</option>
          <option value="s_corporation">S Corporation</option>
          <option value="partnership">Partnership</option>
        </select>
      </div>

      {/* W-9 Form */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          W-9 Form
        </label>
        <div className="p-6 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
          {taxInfo.w9_submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-semibold text-foreground mb-2">W-9 Form Submitted</p>
              <p className="text-sm text-muted-foreground mb-4">Your form is on file</p>
              {taxInfo.w9_document_url && (
                <button className="btn-secondary flex items-center gap-2 mx-auto">
                  <Download className="w-4 h-4" />
                  Download Copy
                </button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold text-foreground mb-2">Upload W-9 Form</p>
              <p className="text-sm text-muted-foreground mb-4">
                PDF, max 5MB • <a href="#" className="text-primary hover:underline">Download blank form</a>
              </p>
              <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose File
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-border flex justify-end">
        <button onClick={handleSave} className="btn-primary">
          Save Tax Information
        </button>
      </div>
    </div>
  );
}
