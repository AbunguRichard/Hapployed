import React, { useState } from 'react';
import { UserPlus, Mail, Crown, Shield, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamsSection({ user, onUnsavedChanges }) {
  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'owner', avatar: '', lastActive: '2 min ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', avatar: '', lastActive: '1 hour ago' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'member', avatar: '', lastActive: '1 day ago' }
  ]);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Teams & Members</h2>
          <p className="text-muted-foreground">Manage team members, roles, and permissions.</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div className="p-6 border-2 border-primary/30 bg-primary/5 rounded-lg">
          <h3 className="font-semibold text-foreground mb-4">Invite Team Member</h3>
          <div className="space-y-4">
            <input type="email" placeholder="Email address" className="input w-full" />
            <select className="input w-full">
              <option value="member">Member - Can view and work on projects</option>
              <option value="admin">Admin - Can manage team and settings</option>
            </select>
            <div className="flex gap-3">
              <button className="btn-primary">Send Invite</button>
              <button onClick={() => setShowInvite(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                {member.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{member.name}</p>
                  {member.role === 'owner' && <Crown className="w-4 h-4 text-yellow-500" />}
                  {member.role === 'admin' && <Shield className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <p className="text-xs text-muted-foreground">Last active {member.lastActive}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select className="input text-sm" value={member.role} disabled={member.role === 'owner'}>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
              {member.role !== 'owner' && (
                <button className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Transfer Ownership */}
      <div className="p-6 border border-orange-500/30 bg-orange-500/5 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-5 h-5 text-orange-500" />
          <p className="font-semibold text-foreground">Transfer Ownership</p>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Transfer organization ownership to another member. This action cannot be undone.</p>
        <button className="btn-secondary text-orange-500 border-orange-500 hover:bg-orange-500/10">Transfer Ownership</button>
      </div>
    </div>
  );
}