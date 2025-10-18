import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Check } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function NotificationsSection({ user, onUnsavedChanges }) {
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    new_gigs: true,
    messages: true,
    job_updates: true,
    marketing: false,
    weekly_digest: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const userId = user?.id || 'test-user';
      const res = await fetch(`${BACKEND_URL}/api/settings/notifications/${userId}`);
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    onUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      const userId = user?.id || 'test-user';
      await fetch(`${BACKEND_URL}/api/settings/notifications/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, user_id: userId })
      });
      toast.success('Notification settings updated!');
      onUnsavedChanges(false);
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Notification Settings</h2>
        <p className="text-muted-foreground">Control how and when you receive notifications.</p>
      </div>

      {/* Notification Channels */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.email_notifications}
              onChange={() => handleToggle('email_notifications')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Browser and mobile push alerts</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.push_notifications}
              onChange={() => handleToggle('push_notifications')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Text message alerts</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.sms_notifications}
              onChange={() => handleToggle('sms_notifications')}
            />
          </div>
        </div>
      </div>

      {/* What to Notify */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">What to Notify</h3>
        <div className="space-y-3">
          <NotificationItem
            label="New Gigs & Opportunities"
            description="When new gigs matching your profile are posted"
            checked={settings.new_gigs}
            onChange={() => handleToggle('new_gigs')}
          />
          <NotificationItem
            label="Messages"
            description="When you receive new messages"
            checked={settings.messages}
            onChange={() => handleToggle('messages')}
          />
          <NotificationItem
            label="Job Updates"
            description="Status updates on your applications"
            checked={settings.job_updates}
            onChange={() => handleToggle('job_updates')}
          />
          <NotificationItem
            label="Marketing & Promotions"
            description="Special offers and platform updates"
            checked={settings.marketing}
            onChange={() => handleToggle('marketing')}
          />
          <NotificationItem
            label="Weekly Digest"
            description="Summary of your week's activity"
            checked={settings.weekly_digest}
            onChange={() => handleToggle('weekly_digest')}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-border flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Check className="w-4 h-4" />
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function NotificationItem({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
