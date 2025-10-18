import React, { useState, useEffect } from 'react';
import { Link2, Check, X, Chrome, Github, Facebook, Linkedin, Twitter } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const AVAILABLE_SERVICES = [
  {
    id: 'google',
    name: 'Google',
    icon: Chrome,
    color: 'from-red-500 to-orange-500',
    description: 'Connect your Google account for quick sign-in'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'from-gray-700 to-gray-900',
    description: 'Link your GitHub profile to showcase your projects'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'from-blue-600 to-blue-700',
    description: 'Import your professional experience and connections'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'from-blue-500 to-blue-600',
    description: 'Enable social sharing and connect with friends'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'from-blue-400 to-blue-500',
    description: 'Share your achievements and updates'
  }
];

export default function ConnectedServicesSection({ user, onUnsavedChanges }) {
  const [connectedServices, setConnectedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnectedServices();
  }, []);

  const fetchConnectedServices = async () => {
    try {
      const userId = user?.id || 'test-user';
      const res = await fetch(`${BACKEND_URL}/api/settings/connected-services/${userId}`);
      const data = await res.json();
      setConnectedServices(data.map(s => s.service_name));
    } catch (error) {
      console.error('Error fetching connected services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (serviceName) => {
    try {
      const userId = user?.id || 'test-user';
      await fetch(`${BACKEND_URL}/api/settings/connected-services/${userId}/connect?service_name=${serviceName}`, {
        method: 'POST'
      });
      toast.success(`${serviceName} connected successfully!`);
      fetchConnectedServices();
    } catch (error) {
      toast.error('Failed to connect service');
    }
  };

  const handleDisconnect = async (serviceId) => {
    try {
      await fetch(`${BACKEND_URL}/api/settings/connected-services/${serviceId}`, {
        method: 'DELETE'
      });
      toast.success('Service disconnected');
      fetchConnectedServices();
    } catch (error) {
      toast.error('Failed to disconnect service');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Connected Services</h2>
        <p className="text-muted-foreground">Link external accounts to enhance your Hapployed experience.</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AVAILABLE_SERVICES.map((service) => {
          const Icon = service.icon;
          const isConnected = connectedServices.includes(service.id);
          
          return (
            <div
              key={service.id}
              className="p-6 border-2 border-border rounded-2xl hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{service.name}</h3>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                        <Check className="w-3 h-3" />
                        Connected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
              
              {isConnected ? (
                <button
                  onClick={() => handleDisconnect(service.id)}
                  className="w-full py-2 px-4 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(service.id)}
                  className={`w-full py-2 px-4 bg-gradient-to-r ${service.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                >
                  <Link2 className="w-4 h-4" />
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="p-6 border border-border rounded-lg bg-blue-50/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Link2 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Why connect services?</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Faster sign-in with OAuth</li>
              <li>• Import your professional profile and portfolio</li>
              <li>• Share your achievements easily</li>
              <li>• Enhance your credibility with verified accounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
