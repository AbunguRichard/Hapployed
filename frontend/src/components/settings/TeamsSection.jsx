import React, { useState, useEffect } from 'react';
import { Users, Mail, Trash2, Crown, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: Users,
  viewer: Eye
};

export default function TeamsSection({ user, onUnsavedChanges }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const teamId = user?.teamId || 'team-123';
      const res = await fetch(`${BACKEND_URL}/api/settings/teams/${teamId}/members`);
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      const teamId = user?.teamId || 'team-123';
      await fetch(`${BACKEND_URL}/api/settings/teams/${teamId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, team_id: teamId })
      });
      toast.success('Invitation sent successfully!');
      setInviteEmail('');
      fetchTeamMembers();
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const handleRemove = async (memberId) => {
    try {
      await fetch(`${BACKEND_URL}/api/settings/teams/members/${memberId}`, {
        method: 'DELETE'
      });
      toast.success('Member removed');
      fetchTeamMembers();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Teams & Members</h2>
        <p className="text-muted-foreground">Invite and manage your team members.</p>
      </div>

      {/* Invite Form */}
      <div className="p-6 border border-border rounded-lg bg-muted/30">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Invite New Member
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="email"
            placeholder="email@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="input md:col-span-2"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="input"
          >
            <option value="viewer">Viewer</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button onClick={handleInvite} className="btn-primary mt-4">
          Send Invitation
        </button>
      </div>

      {/* Team Members List */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Team Members ({members.length})</h3>
        <div className="space-y-3">
          {members.map((member) => {
            const RoleIcon = ROLE_ICONS[member.role] || Users;
            return (
              <div key={member.id} className="p-4 border border-border rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                    {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name || member.email}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      {member.status === 'pending' && (
                        <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                    <RoleIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium capitalize">{member.role}</span>
                  </div>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="p-6 border border-border rounded-lg bg-blue-50/50">
        <h3 className="font-semibold text-foreground mb-3">Role Permissions</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Owner:</strong> Full access, can delete team</p>
          <p><strong>Admin:</strong> Manage members, settings, and billing</p>
          <p><strong>Member:</strong> Post jobs, manage own content</p>
          <p><strong>Viewer:</strong> View-only access</p>
        </div>
      </div>
    </div>
  );
}
