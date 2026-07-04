import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserRoleInfo, UserRoleInfo } from '@/src/lib/userRole';
import { Loader2, DollarSign, CheckCircle2, ArrowRight, Building2, SplitSquareHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CompanyCommitments() {
  const { user } = useAuth();
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<any | null>(null);
  const [paymentRoute, setPaymentRoute] = useState<string>('portal');

  useEffect(() => {
    if (user) {
      getUserRoleInfo(user).then(info => {
        setRoleInfo(info);
        if (info.company?.id) {
          fetchCommitments(info.company.id);
        }
      });
    }
  }, [user]);

  const fetchCommitments = async (companyId: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'commitments'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCommitments(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load employee commitments');
    } finally {
      setLoading(false);
    }
  };

  
  const [paymentStep, setPaymentStep] = useState(1);
  const [splitAmountPortal, setSplitAmountPortal] = useState(0);

  const processPayment = async () => {
    if (!selectedCommitment || !roleInfo?.company?.id) return;
    setIsProcessing(true);
    try {
      // 1. Mark commitment as paid
      await updateDoc(doc(db, 'commitments', selectedCommitment.id), {
        status: 'paid',
        paymentRoute: paymentRoute,
        paidAt: new Date().toISOString()
      });

      if (paymentRoute === 'split') {
        // Create 2 records
        if (splitAmountPortal > 0) {
          await addDoc(collection(db, 'payments'), {
            amount: splitAmountPortal,
            companyId: roleInfo.company.id,
            companyName: roleInfo.company.name,
            ngoId: selectedCommitment.ngoId,
            ngoName: selectedCommitment.ngoName,
            date: new Date().toISOString(),
            status: 'completed',
            routingMode: 'Via Platform',
            type: 'employee_commitment_match_split_portal'
          });
        }
        const directAmt = selectedCommitment.amount - splitAmountPortal;
        if (directAmt > 0) {
          await addDoc(collection(db, 'payments'), {
            amount: directAmt,
            companyId: roleInfo.company.id,
            companyName: roleInfo.company.name,
            ngoId: selectedCommitment.ngoId,
            ngoName: selectedCommitment.ngoName,
            date: new Date().toISOString(),
            status: 'completed',
            routingMode: 'Direct to NGO',
            type: 'employee_commitment_match_split_direct'
          });
        }
      } else {
        await addDoc(collection(db, 'payments'), {
          amount: selectedCommitment.amount,
          companyId: roleInfo.company.id,
          companyName: roleInfo.company.name,
          ngoId: selectedCommitment.ngoId,
          ngoName: selectedCommitment.ngoName,
          date: new Date().toISOString(),
          status: 'completed',
          routingMode: paymentRoute === 'portal' ? 'Via Platform' : 'Direct to NGO',
          type: 'employee_commitment_match'
        });
      }

      toast.success('Payment processed successfully');
      setPaymentStep(1);
      setSelectedCommitment(null);
      fetchCommitments(roleInfo.company.id);
    } catch (e) {
      console.error(e);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenDialog = (c: any) => {
    setSelectedCommitment(c);
    setPaymentStep(1);
    setPaymentRoute('portal');
    setSplitAmountPortal(Math.floor(c.amount / 2));
  };


  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  const pendingCount = commitments.filter(c => c.status === 'pending').length;
  const totalPendingAmount = commitments.filter(c => c.status === 'pending').reduce((acc, c) => acc + (c.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Employee Commitments</h1>
        <p className="text-gray-500">Review employee donations and fulfill matching commitments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Commitments</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pending Matching (₹)</CardDescription>
            <CardTitle className="text-2xl text-amber-600">₹{totalPendingAmount.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commitment Ledger</CardTitle>
          <CardDescription>Manage your corporate matches for employee donations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>NGO</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commitments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No employee commitments found.
                  </TableCell>
                </TableRow>
              ) : commitments.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.employeeName}</div>
                    <div className="text-xs text-gray-500">{new Date(c.date).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>{c.ngoName}</TableCell>
                  <TableCell className="font-medium">₹{c.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'paid' ? 'secondary' : 'default'} className={c.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.status === 'pending' && (
                      
                      <Dialog open={selectedCommitment?.id === c.id} onOpenChange={(open) => !open && setSelectedCommitment(null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => handleOpenDialog(c)}>
                            Process Payment
                          </Button>
                        </DialogTrigger>
                        {selectedCommitment?.id === c.id && (
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Process Commitment</DialogTitle>
                            <DialogDescription>
                              Fulfill the matching commitment for {c.employeeName}'s donation to {c.ngoName}.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {paymentStep === 1 && (
                            <div className="space-y-4 py-4">
                              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                                <span className="font-medium text-gray-700">Total Match Amount</span>
                                <span className="text-xl font-bold text-gray-900">₹{c.amount.toLocaleString()}</span>
                              </div>
                              
                              <div className="space-y-3 pt-2">
                                <label className="text-sm font-medium">Select Payment Route</label>
                                
                                <div 
                                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${paymentRoute === 'portal' ? 'border-indigo-600 bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                                  onClick={() => setPaymentRoute('portal')}
                                >
                                  <div className="flex items-center gap-3">
                                    <Building2 className={`w-5 h-5 ${paymentRoute === 'portal' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <div>
                                      <div className="font-medium">Consolidated via Portal</div>
                                      <div className="text-xs text-gray-500 mt-1">Funds transferred to platform for automated NGO disbursement.</div>
                                    </div>
                                  </div>
                                </div>

                                <div 
                                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${paymentRoute === 'split' ? 'border-indigo-600 bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                                  onClick={() => setPaymentRoute('split')}
                                >
                                  <div className="flex items-center gap-3">
                                    <SplitSquareHorizontal className={`w-5 h-5 ${paymentRoute === 'split' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <div>
                                      <div className="font-medium">Split Funds</div>
                                      <div className="text-xs text-gray-500 mt-1">Send a portion via the portal, and the rest directly to the NGO.</div>
                                    </div>
                                  </div>
                                </div>

                                <div 
                                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${paymentRoute === 'direct' ? 'border-indigo-600 bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                                  onClick={() => setPaymentRoute('direct')}
                                >
                                  <div className="flex items-center gap-3">
                                    <DollarSign className={`w-5 h-5 ${paymentRoute === 'direct' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <div>
                                      <div className="font-medium">Direct to NGO</div>
                                      <div className="text-xs text-gray-500 mt-1">Wire funds directly outside the platform and mark as fulfilled.</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <Button 
                                onClick={() => setPaymentStep(2)} 
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                              >
                                Continue <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          )}

                          {paymentStep === 2 && (
                            <div className="space-y-4 py-4">
                              {paymentRoute === 'split' && (
                                <div className="space-y-4">
                                  <div className="bg-amber-50 text-amber-800 p-3 rounded text-sm mb-2">
                                    Total Amount: ₹{c.amount.toLocaleString()}
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Amount to Portal (₹)</label>
                                    <input 
                                      type="number" 
                                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                                      value={splitAmountPortal}
                                      onChange={(e) => setSplitAmountPortal(Number(e.target.value))}
                                      max={c.amount}
                                      min={0}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Amount Direct to NGO (₹)</label>
                                    <input 
                                      type="number" 
                                      className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm mt-1"
                                      value={c.amount - splitAmountPortal}
                                      disabled
                                    />
                                  </div>
                                </div>
                              )}
                              {paymentRoute === 'direct' && (
                                <div className="p-4 border rounded-lg bg-gray-50 text-sm text-gray-600">
                                  You have selected to pay ₹{c.amount.toLocaleString()} directly to {c.ngoName}. Please ensure you have completed the wire transfer before confirming here.
                                </div>
                              )}
                              {paymentRoute === 'portal' && (
                                <div className="p-4 border rounded-lg bg-gray-50 text-sm text-gray-600">
                                  You have selected to pay ₹{c.amount.toLocaleString()} via the Portal. You will be redirected to the corporate payment gateway.
                                </div>
                              )}

                              <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={() => setPaymentStep(1)} className="flex-1">Back</Button>
                                <Button onClick={() => setPaymentStep(3)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Review</Button>
                              </div>
                            </div>
                          )}

                          {paymentStep === 3 && (
                            <div className="space-y-4 py-4">
                              <div className="bg-gray-50 p-4 rounded-lg border space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">NGO:</span>
                                  <span className="font-medium text-gray-900">{c.ngoName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Employee:</span>
                                  <span className="font-medium text-gray-900">{c.employeeName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Route:</span>
                                  <span className="font-medium text-gray-900 capitalize">{paymentRoute}</span>
                                </div>
                                {paymentRoute === 'split' ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Via Portal:</span>
                                      <span className="font-medium text-gray-900">₹{splitAmountPortal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Direct to NGO:</span>
                                      <span className="font-medium text-gray-900">₹{(c.amount - splitAmountPortal).toLocaleString()}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex justify-between pt-2 border-t mt-2">
                                    <span className="text-gray-500 font-bold">Total Processed:</span>
                                    <span className="font-bold text-gray-900 text-lg">₹{c.amount.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                              
                              <Button 
                                onClick={processPayment} 
                                disabled={isProcessing} 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
                              >
                                {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                                Confirm Transaction
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                        )}
                      </Dialog>

                    )}
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
