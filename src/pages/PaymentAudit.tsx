import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserRoleInfo, UserRoleInfo } from '@/src/lib/userRole';

export function PaymentAudit() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { roleInfo } = useAuth();

  useEffect(() => {
    if (user) {
      getUserRoleInfo(user).then(info => {
        
        fetchPayments(info);
      });
    }
  }, [user]);

  
  const handleDisburse = async (paymentId: string) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        platformDisbursed: true,
        disbursedAt: new Date().toISOString()
      });
      toast.success("Funds successfully disbursed to NGO");
      if (roleInfo) fetchPayments(roleInfo);
    } catch (e) {
      toast.error("Failed to disburse funds");
    }
  };

  const fetchPayments = async (info: UserRoleInfo) => {
    try {
      let q = collection(db, 'payments');
      if (info.role === 'company_admin' && info.company) {
        q = query(q, where('companyId', '==', info.company.id)) as any;
      }

      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPayments(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (payments.length === 0) return;
    const headers = ['Transaction ID', 'Date', 'NGO Name', 'Company Name', 'Amount', 'Mode', 'Status'];
    const rows = payments.map(p => [
      p.id,
      new Date(p.date || Date.now()).toLocaleDateString(),
      `"${p.ngoName || 'N/A'}"`,
      `"${p.companyName || 'N/A'}"`,
      p.amount || 0,
      p.paymentMode || 'direct',
      p.status || 'pending'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Audit</h1>
          <p className="text-gray-500 mt-1">Track transaction status, history, and payment logs for NGO contributions.</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Logs</CardTitle>
          <CardDescription>Comprehensive record of all disbursements and payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient (NGO)</TableHead>
                  {(roleInfo?.role === 'platform_admin' || roleInfo?.role === 'platform_staff') && <TableHead>Sender (Company)</TableHead>}
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Routing Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : payments.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No transactions found.</TableCell></TableRow>
                ) : (
                  payments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.ngoName}</TableCell>
                      {(roleInfo?.role === 'platform_admin' || roleInfo?.role === 'platform_staff') && <TableCell>{payment.companyName}</TableCell>}
                      <TableCell className="font-medium">₹{(payment.amount || 0).toLocaleString()}</TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{payment.routingMode || payment.paymentMode || 'direct'}</Badge>
                      </TableCell>
                      <TableCell>
                        {payment.status === 'completed' && !payment.platformDisbursed && <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1"/> Received</Badge>}
                        {payment.status === 'completed' && payment.platformDisbursed && <Badge className="bg-blue-100 text-blue-800 border-blue-200"><CheckCircle className="w-3 h-3 mr-1"/> Disbursed</Badge>}
                        {payment.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                        {payment.status === 'failed' && <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>}
                      </TableCell>
                      <TableCell>
                        {(roleInfo?.role === 'platform_admin' || roleInfo?.role === 'platform_staff') && 
                         payment.status === 'completed' && 
                         payment.routingMode === 'Via Platform' && 
                         !payment.platformDisbursed && (
                          <Button size="sm" onClick={() => handleDisburse(payment.id)} className="bg-indigo-600 hover:bg-indigo-700">
                            <Send className="w-4 h-4 mr-2"/> Disburse to NGO
                          </Button>
                        )}
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
