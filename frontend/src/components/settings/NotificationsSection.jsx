import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Monitor, Moon } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsSection({ user, onUnsavedChanges }) {
  const [preferences, setPreferences] = useState({
    newMessage: { push: true, email: true, sms: false, inApp: true },
    jobPosted: { push: true, email: true, sms: false, inApp: true },
    applicationUpdate: { push: true, email: true, sms: true, inApp: true },
    paymentReceived: { push: true, email: true, sms: true, inApp: true },
    teamInvite: { push: true, email: true, sms: false, inApp: true },
    weeklyDigest: { push: false, email: true, sms: false, inApp: false }
  });

  const [quietHours, setQuietHours] = useState({ start: '22:00', end: '08:00', enabled: true });

  const events = [
    { key: 'newMessage', label: 'New Messages', description: 'When someone sends you a message' },
    { key: 'jobPosted', label: 'New Job Posted', description: 'Matching jobs in your area' },
    { key: 'applicationUpdate', label: 'Application Updates', description: 'Status changes on your applications' },
    { key: 'paymentReceived', label: 'Payment Received', description: 'When you receive a payment' },
    { key: 'teamInvite', label: 'Team Invitations', description: 'When invited to join a team' },
    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of activity' }
  ];

  const togglePreference = (event, channel) => {
    setPreferences(prev => ({
      ...prev,
      [event]: { ...prev[event], [channel]: !prev[event][channel] }
    }));
    onUnsavedChanges(true);
  };

  const handleSave = () => {
    toast.success('Notification preferences saved!');
    onUnsavedChanges(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Notification Settings</h2>
        <p className="text-muted-foreground">Choose how you want to be notified about activity.</p>
      </div>

      {/* Quiet Hours */}
      <div className="p-6 border border-border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Quiet Hours</p>
              <p className="text-sm text-muted-foreground">Pause notifications during these hours</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={quietHours.enabled} onChange={(e) => setQuietHours({...quietHours, enabled: e.target.checked})} className="sr-only peer" />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        {quietHours.enabled && (
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Start</label>
              <input type="time" value={quietHours.start} onChange={(e) => setQuietHours({...quietHours, start: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">End</label>
              <input type="time" value={quietHours.end} onChange={(e) => setQuietHours({...quietHours, end: e.target.value})} className="input" />
            </div>
          </div>
        )}
      </div>

      {/* Notification Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Event</th>
              <th className="text-center py-3 px-4">
                <div className="flex flex-col items-center gap-1">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Push</span>
                </div>
              </th>
              <th className="text-center py-3 px-4">
                <div className="flex flex-col items-center gap-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Email</span>
                </div>
              </th>
              <th className="text-center py-3 px-4">
                <div className="flex flex-col items-center gap-1">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">SMS</span>
                </div>
              </th>
              <th className="text-center py-3 px-4">
                <div className="flex flex-col items-center gap-1">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">In-App</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.key} className="border-b border-border hover:bg-muted/50">
                <td className="py-4 px-4">
                  <p className="font-medium text-foreground">{event.label}</p>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </td>
                <td className="text-center py-4 px-4">
                  <input type="checkbox" checked={preferences[event.key].push} onChange={() => togglePreference(event.key, 'push')} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                </td>
                <td className="text-center py-4 px-4">
                  <input type="checkbox" checked={preferences[event.key].email} onChange={() => togglePreference(event.key, 'email')} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                </td>
                <td className="text-center py-4 px-4">
                  <input type="checkbox" checked={preferences[event.key].sms} onChange={() => togglePreference(event.key, 'sms')} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                </td>
                <td className="text-center py-4 px-4">
                  <input type="checkbox" checked={preferences[event.key].inApp} onChange={() => togglePreference(event.key, 'inApp')} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">Save Preferences</button>
      </div>
    </div>
  );
}