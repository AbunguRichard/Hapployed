import React, { useState } from 'react';
import { Key, Smartphone, Shield, Monitor, Download, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function SecuritySection({ user, onUnsavedChanges }) {
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on MacOS', ip: '192.168.1.1', lastSeen: '2 minutes ago', current: true },
    { id: 2, device: 'Safari on iPhone', ip: '192.168.1.5', lastSeen: '1 day ago', current: false }
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Password & Security</h2>
        <p className="text-muted-foreground">Manage your password, two-factor authentication, and active sessions.</p>
      </div>

      {/* Password */}
      <div className="p-6 border border-border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Password</p>
              <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
            </div>
          </div>
          <button className="btn-secondary">Change Password</button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="p-6 border border-border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
          </div>
          <button onClick={() => setShowMFASetup(!showMFASetup)} className="btn-primary">Setup MFA</button>
        </div>
        {showMFASetup && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm mb-3">Choose your authentication method:</p>
            <div className="space-y-2">
              <button className="w-full p-3 border border-border rounded-lg text-left hover:bg-muted transition-colors">
                Authenticator App (Recommended)
              </button>
              <button className="w-full p-3 border border-border rounded-lg text-left hover:bg-muted transition-colors">
                SMS Text Message
              </button>
              <button className="w-full p-3 border border-border rounded-lg text-left hover:bg-muted transition-colors">
                Security Key (WebAuthn)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Active Sessions</h3>
          <button className="text-sm text-red-500 hover:text-red-600 font-medium">Sign Out All</button>
        </div>
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="p-4 border border-border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {session.device}
                    {session.current && <span className="ml-2 text-xs text-green-500">Current</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{session.ip} • {session.lastSeen}</p>
                </div>
              </div>
              {!session.current && (
                <button className="text-sm text-red-500 hover:text-red-600">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Codes */}
      <div className="p-6 border border-accent/30 bg-accent/5 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-accent" />
          <p className="font-semibold text-foreground">Recovery Codes</p>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Download backup codes in case you lose access to your authentication method</p>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Generate Recovery Codes
        </button>
      </div>
    </div>
  );
}