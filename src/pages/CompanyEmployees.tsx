import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { toast } from 'sonner';

export function CompanyEmployees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    import('@/src/lib/userRole').then(({ getUserRoleInfo }) => {
      getUserRoleInfo(user).then(info => {
        if (info.company) {
          setCompanyId(info.company.id);
          fetchEmployees(info.company.id, info.company.allowedDomains || []);
          
          if ((info.company as any).invitedEmails) {
            setInvitedEmails((info.company as any).invitedEmails);
          }
        }
      });
    });
  }, [user]);

  const fetchEmployees = async (cid: string, domains: string[]) => {
    // We would ideally query a users collection, but since we don't have all users linked directly
    // in this prototype we will simulate fetching users who belong to the company domains.
    // Let's just fetch from 'users' collection where their email matches the domains or invited list.
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const companyUsers = usersSnap.docs.map(d => ({id: d.id, ...d.data()})).filter((u: any) => {
        if (!u.email) return false;
        const domain = u.email.split('@')[1];
        return domains.includes(domain) || invitedEmails.includes(u.email.toLowerCase());
      });
      setEmployees(companyUsers);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInvite = async () => {
    if (!newEmail || !companyId) return;
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        invitedEmails: arrayUnion(newEmail.toLowerCase())
      });
      setInvitedEmails([...invitedEmails, newEmail.toLowerCase()]);
      setNewEmail('');
      toast.success('Invitation sent (Simulated)');
    } catch (e) {
      toast.error('Failed to invite user');
    }
  };

  const handleRemoveInvite = async (emailToRemove: string) => {
    if (!companyId) return;
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        invitedEmails: arrayRemove(emailToRemove)
      });
      setInvitedEmails(invitedEmails.filter(e => e !== emailToRemove));
      toast.success('User access revoked');
    } catch (e) {
      toast.error('Failed to revoke access');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Roster</h1>
          <p className="text-gray-500 mt-1">Manage user access and see who is registered.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invite Employees</CardTitle>
          <CardDescription>Manually invite contractors or employees who don't match your auto-enroll domains.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Input 
              placeholder="contractor@agency.com" 
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)} 
            />
            <Button onClick={handleInvite} className="bg-indigo-600 hover:bg-indigo-700">Send Invite</Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-700">Manually Granted Access</h3>
            {invitedEmails.length === 0 ? (
              <p className="text-sm text-gray-500">No manual invites sent.</p>
            ) : (
              invitedEmails.map((email, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-700">{email}</span>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveInvite(email)} className="text-red-600 hover:bg-red-50 hover:text-red-700">Revoke Access</Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Employees</CardTitle>
          <CardDescription>Employees who have logged into the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No employees registered yet.</div>
          ) : (
            <div className="space-y-4">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-4 p-3 bg-white border rounded-lg">
                  <img src={emp.photoURL || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="font-medium">{emp.name || emp.email}</div>
                    <div className="text-sm text-gray-500">{emp.email}</div>
                  </div>
                  <div className="text-sm bg-gray-100 px-2 py-1 rounded">Active</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
