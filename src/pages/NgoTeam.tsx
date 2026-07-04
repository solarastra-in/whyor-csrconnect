import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';

export function NgoTeam() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [charityId, setCharityId] = useState<string | null>(null);

  useEffect(() => {
    import('@/src/lib/userRole').then(({ getUserRoleInfo }) => {
      getUserRoleInfo(user).then(info => {
        if (info.charity) {
          setCharityId(info.charity.id);
          setEmails(info.charity.adminEmails || []);
        }
      });
    });
  }, [user]);

  const handleAddMember = async () => {
    if (!newEmail || !charityId) return;
    try {
      await updateDoc(doc(db, 'charities', charityId), {
        adminEmails: arrayUnion(newEmail.toLowerCase())
      });
      setEmails([...emails, newEmail.toLowerCase()]);
      setNewEmail('');
      toast.success('Team member added');
    } catch (e) {
      toast.error('Failed to add team member');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">NGO Team Management</h1>
        <p className="text-gray-500 mt-1">Add colleagues to help manage your NGO profile.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Users who can access and manage this NGO.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {emails.map((email, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">{email}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Admin</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Input 
              placeholder="colleague@ngo.org" 
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)} 
            />
            <Button onClick={handleAddMember} className="bg-green-600 hover:bg-green-700">Add Member</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
