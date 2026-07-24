import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserRoleInfo, UserRoleInfo } from '@/src/lib/userRole';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CompanyGrants() {
  const { user } = useAuth();
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { roleInfo } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newGrant, setNewGrant] = useState({ project: '', ngo: '', amountRequested: 0, category: '' });

  const [reviewGrantId, setReviewGrantId] = useState<string | null>(null);
  const [selectedCharityDetails, setSelectedCharityDetails] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);


  useEffect(() => {
    if (user) {
      getUserRoleInfo(user).then(info => {
        
        if (info.company?.id) {
          fetchGrants(info.company.id);
        } else {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchGrants = async (companyId?: string) => {
    const cid = companyId || roleInfo?.company?.id;
    if (!cid) return;
    try {
      const qTargeted = query(collection(db, 'grants'), where('companyId', '==', cid));
      const qGeneral = query(collection(db, 'grants'), where('companyId', '==', 'general_pool'));
      
      const [snapTargeted, snapGeneral] = await Promise.all([
        getDocs(qTargeted),
        getDocs(qGeneral)
      ]);

      const allDocs = [...snapTargeted.docs, ...snapGeneral.docs];
      const uniqueDocsMap = new Map();
      allDocs.forEach(doc => {
        uniqueDocsMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      const fetchedGrants = Array.from(uniqueDocsMap.values()).map((grant: any) => ({
        ...grant,
        title: grant.title || grant.project || 'Grant Application',
        ngoName: grant.ngoName || grant.ngo || 'Partner NGO',
        category: grant.sdgCategory || grant.category || 'General CSR',
        status: (grant.status === 'pending_review' ? 'pending' : grant.status) || 'pending'
      }));

      // Sort by creation date descending
      fetchedGrants.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.date || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.date || 0).getTime();
        return timeB - timeA;
      });

      setGrants(fetchedGrants);
    } catch (error) {
      console.error("Error fetching grants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrant = async () => {
    if (!newGrant.project || !newGrant.ngo || newGrant.amountRequested <= 0) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await addDoc(collection(db, 'grants'), {
        title: newGrant.project,
        project: newGrant.project,
        ngoName: newGrant.ngo,
        ngo: newGrant.ngo,
        category: newGrant.category,
        sdgCategory: newGrant.category,
        amountRequested: newGrant.amountRequested,
        status: 'pending',
        date: new Date().toISOString(),
        companyId: roleInfo?.company?.id || '',
        companyName: roleInfo?.company?.name || 'Corporate Partner'
      });
      toast.success('Grant cycle created!');
      setIsCreating(false);
      fetchGrants();
    } catch (e) {
      toast.error('Failed to create grant');
    }
  };

  const openReview = async (grant: any) => {
    setReviewGrantId(grant.id);
    setPaymentAmount(grant.amountRequested);
    
    try {
      if (grant.ngoId) {
        const docSnap = await getDocs(query(collection(db, 'charities'), where('__name__', '==', grant.ngoId)));
        if (!docSnap.empty) {
          setSelectedCharityDetails({ id: docSnap.docs[0].id, ...docSnap.docs[0].data() });
          return;
        }
      }
      const ngoQueryName = grant.ngoName || grant.ngo;
      if (ngoQueryName) {
        const q = query(collection(db, 'charities'), where('name', '==', ngoQueryName));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setSelectedCharityDetails({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setSelectedCharityDetails(null);
        }
      } else {
        setSelectedCharityDetails(null);
      }
    } catch (e) {
      console.error('Error opening grant review:', e);
      setSelectedCharityDetails(null);
    }
  };

  const handleApproveGrant = async () => {
    if (!reviewGrantId) return;
    try {
      await updateDoc(doc(db, 'grants', reviewGrantId), { status: 'approved' });
      
      const grant = grants.find(g => g.id === reviewGrantId);
      const targetNgoId = selectedCharityDetails?.id || grant?.ngoId || '';
      
      // Create payment record
      await addDoc(collection(db, 'payments'), {
        referenceId: reviewGrantId,
        amount: paymentAmount,
        ngoId: targetNgoId,
        charityId: targetNgoId,
        ngoName: grant?.ngoName || grant?.ngo || selectedCharityDetails?.name || 'Partner NGO',
        companyId: roleInfo?.company?.id || grant?.companyId || '',
        companyName: roleInfo?.company?.name || 'Corporate Partner',
        status: 'pending',
        date: new Date().toISOString(),
        paymentMode: selectedCharityDetails?.paymentConfig?.paymentMode || 'direct',
        type: 'grant'
      });
      
      toast.success('Grant approved & payment initiated!');
      setReviewGrantId(null);
      fetchGrants(roleInfo?.company?.id);
    } catch (e) {
      toast.error('Failed to approve grant');
    }
  };


  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'grants', id), { status: newStatus });
      toast.success(`Grant ${newStatus}!`);
      fetchGrants();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };
  return (
    <div className="space-y-6">

        <Dialog open={!!reviewGrantId} onOpenChange={(open) => !open && setReviewGrantId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review & Disburse Grant</DialogTitle>
              <DialogDescription>Review payment details based on NGO configuration.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Approved Amount (₹)</Label>
                <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} />
              </div>
              
              {selectedCharityDetails ? (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                  <div className="font-medium text-gray-900 border-b pb-2">NGO Payment Configuration</div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Routing Mode:</span>
                    <span className="font-medium uppercase">{selectedCharityDetails.paymentConfig?.paymentMode || 'Direct'}</span>
                  </div>
                  {selectedCharityDetails.paymentConfig?.paymentMode === 'split' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">NGO Split:</span>
                      <span className="font-medium">{selectedCharityDetails.paymentConfig?.splitPercentage}%</span>
                    </div>
                  )}
                  {selectedCharityDetails.paymentConfig?.platformFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Platform Fee:</span>
                      <span className="font-medium">{selectedCharityDetails.paymentConfig?.platformFee}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank Details:</span>
                    <span className="font-medium">{selectedCharityDetails.paymentConfig?.bankDetails || 'Not Provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">UPI ID:</span>
                    <span className="font-medium">{selectedCharityDetails.paymentConfig?.upiDetails || 'Not Provided'}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-lg text-amber-800 text-sm">
                  Could not find verified payment configuration for this NGO. Payment will be processed manually.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewGrantId(null)}>Cancel</Button>
              <Button onClick={handleApproveGrant} className="bg-green-600 hover:bg-green-700">Approve & Disburse</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Corporate Grantmaking</h1>
          <p className="text-gray-500 mt-1">Review grant applications from NGOs, allocate funds, and track outcomes.</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">Create Grant Cycle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Grant Cycle</DialogTitle>
              <DialogDescription>Open a new grant application cycle for NGOs.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>NGO Name</Label>
                <Input placeholder="e.g. Jal Foundation" value={newGrant.ngo} onChange={e => setNewGrant({...newGrant, ngo: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input placeholder="e.g. Clean Ganga Initiative" value={newGrant.project} onChange={e => setNewGrant({...newGrant, project: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input placeholder="e.g. Environment" value={newGrant.category} onChange={e => setNewGrant({...newGrant, category: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Amount Requested (₹)</Label>
                <Input type="number" value={newGrant.amountRequested || ''} onChange={e => setNewGrant({...newGrant, amountRequested: Number(e.target.value)})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreateGrant} className="bg-blue-600">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Grants Budget</CardDescription>
            <CardTitle className="text-2xl">₹10,000,000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">FY 2023-2024</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Funds Allocated</CardDescription>
            <CardTitle className="text-2xl text-green-600">₹{grants.filter(g => g.status === 'approved').reduce((acc, curr) => acc + (Number(curr.amountRequested) || 0), 0).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">25% of total budget</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-2xl text-amber-600">₹{grants.filter(g => g.status === 'pending').reduce((acc, curr) => acc + (Number(curr.amountRequested) || 0), 0).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">1 application pending review</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Grant Applications</CardTitle>
          <CardDescription>Manage incoming requests from onboarded NGOs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>NGO & Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">Loading grants...</TableCell>
                </TableRow>
              ) : grants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">No grants found.</TableCell>
                </TableRow>
              ) : grants.map((grant) => (
                <TableRow key={grant.id}>
                  <TableCell className="font-mono text-xs">{grant.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{grant.ngoName || grant.ngo || 'Partner NGO'}</div>
                    <div className="text-xs text-gray-500">{grant.title || grant.project || 'Grant Proposal'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{grant.category}</Badge>
                  </TableCell>
                  <TableCell>{grant.amountRequested.toLocaleString()}</TableCell>
                  <TableCell>
                    {grant.status === 'pending' && <Badge variant="secondary" className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                    {grant.status === 'approved' && <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>}
                    {grant.status === 'rejected' && <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="h-8"><FileText className="w-4 h-4 mr-1"/> View Pitch</Button>
                      {grant.status === 'pending' && (
                        <Button variant="default" size="sm" className="h-8 bg-blue-600" onClick={() => openReview(grant)}>Review</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
