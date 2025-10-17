import React, { useState } from 'react';
import { Link2, CheckCircle, Clock, Linkedin, Github, Calendar, DollarSign, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ConnectedServicesSection({ user, onUnsavedChanges }) {
  const [connections, setConnections] = useState([
    { id: 'google', name: 'Google', connected: true, lastSync: '2 hours ago', icon: Mail, scopes: ['Profile', 'Email'] },
    { id: 'linkedin', name: 'LinkedIn', connected: true, lastSync: '1 day ago', icon: Linkedin, scopes: ['Profile', 'Work History'] },
    { id: 'github', name: 'GitHub', connected: false, lastSync: null, icon: Github, scopes: [] },
    { id: 'calendar', name: 'Google Calendar', connected: true, lastSync: '5 min ago', icon: Calendar, scopes: ['Calendar Access', 'Availability'] },
    { id: 'paypal', name: 'PayPal', connected: false, lastSync: null, icon: DollarSign, scopes: [] }
  ]);

  const handleConnect = (id) => {
    toast.success(`Connecting to ${connections.find(c => c.id === id).name}...`);
  };

  const handleDisconnect = (id) => {
    setConnections(prev => prev.map(c => 
      c.id === id ? { ...c, connected: false, lastSync: null, scopes: [] } : c
    ));
    toast.success('Service disconnected');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Connected Services</h2>
        <p className="text-muted-foreground">Manage your OAuth connections and integrations.</p>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {connections.map(service => {
          const Icon = service.icon;
          return (
            <div key={service.id} className="p-6 border border-border rounded-lg hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{service.name}</h3>
                      {service.connected && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    
                    {service.connected ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-3">
                          Last synced: {service.lastSync}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {service.scopes.map(scope => (
                            <span key={scope} className="badge badge-purple text-xs">{scope}</span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Connect to sync your data and enable integrations
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {service.connected ? (
                    <>
                      <button className="btn-secondary text-sm">Refresh</button>
                      <button onClick={() => handleDisconnect(service.id)} className="text-red-500 hover:text-red-600 text-sm font-medium px-3">
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleConnect(service.id)} className="btn-primary">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Settings */}
      <div className="p-6 border border-border rounded-lg bg-muted/30">
        <h3 className="font-semibold text-foreground mb-4">Integration Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Auto-import profile updates</p>
              <p className="text-sm text-muted-foreground">Sync changes from connected services</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Sync calendar availability</p>
              <p className="text-sm text-muted-foreground">Update availability based on calendar</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Share project updates</p>
              <p className="text-sm text-muted-foreground">Post completed projects to LinkedIn</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-primary rounded" />
          </label>
        </div>
      </div>
    </div>
  );
}