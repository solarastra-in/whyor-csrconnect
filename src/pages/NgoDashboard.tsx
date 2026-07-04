import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getUserRoleInfo } from '@/src/lib/userRole';
import { Progress } from '@/components/ui/progress';

export function NgoDashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserRoleInfo(user).then(info => {
        if (info.charity?.id) {
          fetchPayments(info.charity.id);
        } else {
          setLoading(false);
        }
      });
    }
  }, [user]);

  const fetchPayments = async (charityId: string) => {
    try {
      const q = query(collection(db, 'payments'), where('ngoId', '==', charityId));
      const snap = await getDocs(q);
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const portalPending = payments.filter(p => p.status === 'pending' && p.paymentMode !== 'direct').reduce((sum, p) => sum + (p.amount || 0), 0);
  const directPending = payments.filter(p => p.status === 'pending' && p.paymentMode === 'direct').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCompleted = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">NGO Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your projects, volunteers, and track payouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Received</CardTitle>
            <CardDescription>Completed grants and donations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹{totalCompleted.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Pending Payouts</CardTitle>
            <CardDescription>Funds currently being processed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Held by Portal (Split / Portal Mode)</span>
                <span className="font-bold text-indigo-600">₹{portalPending.toLocaleString()}</span>
              </div>
              <Progress value={Math.min((portalPending / (portalPending + directPending || 1)) * 100, 100)} className="h-2 bg-gray-100 [&>div]:bg-indigo-600" />
              <p className="text-xs text-gray-500">Processed by the platform and disbursed to your bank.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Direct Transfers</span>
                <span className="font-bold text-amber-600">₹{directPending.toLocaleString()}</span>
              </div>
              <Progress value={Math.min((directPending / (portalPending + directPending || 1)) * 100, 100)} className="h-2 bg-gray-100 [&>div]:bg-amber-500" />
              <p className="text-xs text-gray-500">Sent directly by the company to your provided accounts.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
