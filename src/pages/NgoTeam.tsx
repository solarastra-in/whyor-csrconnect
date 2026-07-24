import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Mail, Shield, UserCheck, Clock, Trash2, UserPlus } from 'lucide-react';

export function NgoTeam() {
  const { user } = useAuth();
  const [activeAdmins, setActiveAdmins] = useState<string[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('project_manager');
  const [charityId, setCharityId] = useState<string | null>(null);

  useEffect(() => {
    import('@/src/lib/userRole').then(({ getUserRoleInfo }) => {
      getUserRoleInfo(user).then(info => {
        if (info.charity) {
          setCharityId(info.charity.id);
          setActiveAdmins(info.charity.adminEmails || []);
          setPendingInvites((info.charity as any).pendingInvites || []);
        }
      });
    });
  }, [user]);

  const handleSendInvite = async () => {
    if (!newEmail || !charityId) return;
    const cleanEmail = newEmail.trim().toLowerCase();

    if (activeAdmins.includes(cleanEmail)) {
      toast.error('This user is already an active co-admin');
      return;
    }

    try {
      const newInvite = {
        email: cleanEmail,
        role: selectedRole,
        status: 'pending_acceptance',
        invitedAt: new Date().toISOString()
      };

      const updatedInvites = [...pendingInvites, newInvite];
      await updateDoc(doc(db, 'charities', charityId), {
        pendingInvites: updatedInvites
      });

      setPendingInvites(updatedInvites);
      setNewEmail('');
      toast.success(`Invitation sent to ${cleanEmail}`, {
        description: `Invited as ${selectedRole.replace('_', ' ').toUpperCase()} (Pending Acceptance)`
      });
    } catch (e) {
      toast.error('Failed to send invitation');
    }
  };

  const handleAcceptInvite = async (invToAccept: any) => {
    if (!charityId || !user?.email) return;
    try {
      const updatedInvites = pendingInvites.filter(inv => inv.email !== invToAccept.email);
      const updatedActive = Array.from(new Set([...activeAdmins, invToAccept.email]));

      await updateDoc(doc(db, 'charities', charityId), {
        pendingInvites: updatedInvites,
        adminEmails: updatedActive
      });

      setPendingInvites(updatedInvites);
      setActiveAdmins(updatedActive);
      toast.success('Invitation accepted! You are now an active team member.');
    } catch (e) {
      toast.error('Failed to accept invitation');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">NGO Team & Access Control</h1>
        <p className="text-gray-500 mt-1">Manage team member invitations, permission tiers, and active co-admins.</p>
      </div>

      {/* Invite Form Card */}
      <Card className="border border-emerald-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <CardTitle>Invite New Team Member</CardTitle>
          </div>
          <CardDescription>Send a role-based invitation to a colleague. Invites require user acceptance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Input 
              placeholder="colleague@ngo.org" 
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_admin">Full Co-Admin</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="finance_viewer">Finance / Payout Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSendInvite} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <CardTitle>Pending Invitations</CardTitle>
          </div>
          <CardDescription>Colleagues who have been invited but have not yet accepted access.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingInvites.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-lg">No pending invitations.</p>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((inv, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/60 gap-3">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-600" />
                      {inv.email}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>Role: <strong className="capitalize">{inv.role.replace('_', ' ')}</strong></span>
                      <span>•</span>
                      <span>Invited: {new Date(inv.invitedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    {user?.email?.toLowerCase() === inv.email.toLowerCase() ? (
                      <Button size="sm" onClick={() => handleAcceptInvite(inv)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                        Accept & Join Team
                      </Button>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-medium">
                        Pending Acceptance
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleRevokeInvite(inv.email)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Co-Admins */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <CardTitle>Active Team Members</CardTitle>
          </div>
          <CardDescription>Users with verified access to manage this NGO's account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeAdmins.map((email, i) => (
              <div key={i} className="flex justify-between items-center p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {email[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{email}</div>
                    <div className="text-xs text-gray-500">Verified NGO Administrator</div>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  Active Admin
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
