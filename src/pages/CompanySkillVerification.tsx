import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, FileCheck, ExternalLink, Clock, Loader2 } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

export function CompanySkillVerification() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchVerifications();
  }, [user]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const companyDomain = user?.email?.split('@')[1];
      if (!companyDomain) return;

      const q = query(collection(db, 'skillVerifications'), where('companyDomain', '==', companyDomain));
      const snapshot = await getDocs(q);
      
      let data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Seed with some mock data if empty for demo purposes
      if (data.length === 0) {
        data = [
          {
            id: 'mock-1',
            employeeName: 'Sarah Jenkins',
            department: 'Engineering',
            skill: 'First Aid / CPR',
            submittedAt: '2026-06-28',
            status: 'pending',
            proofUrl: '#',
            notes: 'Completed American Red Cross certification'
          },
          {
            id: 'mock-2',
            employeeName: 'David Chen',
            department: 'Design',
            skill: 'Sign Language',
            submittedAt: '2026-06-29',
            status: 'pending',
            proofUrl: '#',
            notes: 'ASL Level 2 certification'
          }
        ];
      }
      
      setVerifications(data);
    } catch(e) {
      console.error(e);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      if (id.startsWith('mock-')) {
        setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
        toast.success(`Skill ${newStatus}`);
        return;
      }
      
      await updateDoc(doc(db, 'skillVerifications', id), { status: newStatus });
      setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
      toast.success(`Skill ${newStatus}`);
    } catch(e) {
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Skill Verification</h1>
          <p className="text-gray-500 mt-1">Review and approve employee skills for specialized volunteering.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              Pending Reviews
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">{pendingCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Employees have uploaded proof for these skills. Verify them to unlock specialized volunteering opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : pendingCount === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-sm font-medium text-gray-900">All caught up!</h3>
                <p className="text-sm text-gray-500 mt-1">No pending skill verifications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.filter(v => v.status === 'pending').map((verification) => (
                  <div key={verification.id} className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                        {verification.employeeName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{verification.employeeName}</h4>
                        <p className="text-sm text-gray-500 mb-2">{verification.department}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {verification.skill}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> Submitted {verification.submittedAt}
                          </span>
                        </div>
                        
                        {verification.notes && (
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                            "{verification.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.open(verification.proofUrl, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" /> View Proof
                      </Button>
                      <div className="flex gap-2 w-full">
                        <Button variant="outline" size="sm" className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100" onClick={() => handleStatusUpdate(verification.id, 'approved')}>
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100" onClick={() => handleStatusUpdate(verification.id, 'rejected')}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}