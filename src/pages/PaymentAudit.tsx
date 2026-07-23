import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { NgoPayoutConfigDialog } from '@/src/components/NgoPayoutConfigDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CheckCircle, XCircle, Clock, Send, TrendingUp, AlertTriangle, Settings2, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserRoleInfo, UserRoleInfo } from '@/src/lib/userRole';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function PaymentAudit() {
  const { user } = useAuth();
  
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [isBatchDisbursing, setIsBatchDisbursing] = useState(false);

  // Risk thresholds state
  const [feeThreshold, setFeeThreshold] = useState<number>(10); // alert if platform fee > 10%
  const [minPayoutThreshold, setMinPayoutThreshold] = useState<number>(15000); // alert if projected monthly payout < ₹15,000
  const [charities, setCharities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

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

  const eligibleForDisbursement = payments.filter((p: any) => p.status === 'completed' && p.routingMode === 'Via Platform' && !p.platformDisbursed);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(new Set(eligibleForDisbursement.map((p: any) => p.id)));
    } else {
      setSelectedPayments(new Set());
    }
  };

  const handleSelectOne = (checked: boolean, id: string) => {
    const newSet = new Set(selectedPayments);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedPayments(newSet);
  };

  const handleBatchDisburse = async () => {
    if (selectedPayments.size === 0) return;
    setIsBatchDisbursing(true);
    try {
      const promises = Array.from(selectedPayments).map((id: string) => 
        updateDoc(doc(db, 'payments', id), {
          platformDisbursed: true,
          disbursedAt: new Date().toISOString()
        })
      );
      await Promise.all(promises);
      toast.success(`Successfully disbursed ${selectedPayments.size} payment(s)`);
      setSelectedPayments(new Set());
      if (roleInfo) fetchPayments(roleInfo);
    } catch (e) {
      toast.error("Failed to disburse funds");
      console.error(e);
    } finally {
      setIsBatchDisbursing(false);
    }
  };

  const fetchPayments = async (info: UserRoleInfo) => {
    setLoading(true);
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

  // Fetch charities and compute payout risks
  const fetchCharitiesAndRunRiskAnalysis = async () => {
    if (roleInfo?.role !== 'platform_admin' && roleInfo?.role !== 'platform_staff') return;
    setLoadingAlerts(true);
    try {
      const charSnap = await getDocs(collection(db, 'charities'));
      const fetchedCharities = charSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCharities(fetchedCharities);
      
      const newAlerts: any[] = [];
      
      fetchedCharities.forEach((charity: any) => {
        const config = charity.paymentConfig || {};
        const platformFee = Number(config.platformFee) || 0;
        const splitPercentage = Number(config.splitPercentage) || 100;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const charityPayments = payments.filter((p: any) => 
          p.status === 'completed' && 
          (p.charityId === charity.id || p.ngoId === charity.id || p.ngoName === charity.name)
        );
        
        const recentPayments = charityPayments.filter((p: any) => {
          const pDate = p.date ? new Date(p.date) : new Date();
          return pDate >= thirtyDaysAgo;
        });
        
        let grossMonthly = recentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const isBaseline = grossMonthly === 0;
        if (isBaseline) {
          grossMonthly = 50000; // standard evaluation baseline for alerting
        }
        
        const routedViaPlatform = grossMonthly * (splitPercentage / 100);
        const routedDirect = grossMonthly * (1 - splitPercentage / 100);
        const feeDeducted = routedViaPlatform * (platformFee / 100);
        const projectedPayout = routedDirect + (routedViaPlatform - feeDeducted);
        
        const triggers: string[] = [];
        let riskLevel: 'warning' | 'critical' = 'warning';
        
        if (platformFee > feeThreshold) {
          triggers.push(`High platform fee of ${platformFee}% exceeds threshold of ${feeThreshold}%.`);
          if (platformFee > 15) riskLevel = 'critical';
        }
        
        if (projectedPayout < minPayoutThreshold) {
          triggers.push(`Projected payout of ₹${Math.round(projectedPayout).toLocaleString()} falls below safe threshold of ₹${minPayoutThreshold.toLocaleString()}.`);
          if (projectedPayout < minPayoutThreshold / 2) riskLevel = 'critical';
        }
        
        if (triggers.length > 0) {
          newAlerts.push({
            charityId: charity.id,
            charityName: charity.name,
            platformFee,
            splitPercentage,
            grossMonthly,
            projectedPayout,
            feeDeducted,
            triggers,
            riskLevel,
            isBaseline
          });
        }
      });
      
      setAlerts(newAlerts);
    } catch (err) {
      console.error("Error running risk analysis:", err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (payments.length > 0) {
      fetchCharitiesAndRunRiskAnalysis();
    }
  }, [payments, feeThreshold, minPayoutThreshold]);

  // Aggregate monthly payout details for the last 6 months
  const getHistoricalChartData = () => {
    const monthsData: { name: string; timestamp: number; Gross: number; NetPayout: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const name = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthsData.push({
        name,
        timestamp: d.getTime(),
        Gross: 0,
        NetPayout: 0
      });
    }

    payments.forEach(p => {
      if (p.status !== 'completed') return;
      const pDate = new Date(p.date || Date.now());
      
      const monthObj = monthsData.find(m => {
        const mDate = new Date(m.timestamp);
        return mDate.getFullYear() === pDate.getFullYear() && mDate.getMonth() === pDate.getMonth();
      });
      
      if (monthObj) {
        const amount = Number(p.amount) || 0;
        monthObj.Gross += amount;
        
        // Use payout details if charity has them, else use a general estimate
        const feeRate = Number(p.platformFee) || 5; 
        const splitRate = Number(p.splitPercentage) || 100;
        
        const platformShare = amount * (splitRate / 100);
        const directShare = amount * (1 - splitRate / 100);
        const feeDeducted = platformShare * (feeRate / 100);
        const netPayout = directShare + (platformShare - feeDeducted);
        
        monthObj.NetPayout += netPayout;
      }
    });

    return monthsData;
  };

  const chartData = getHistoricalChartData();

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

  const isAdminOrStaff = roleInfo?.role === 'platform_admin' || roleInfo?.role === 'platform_staff';

  return (
    <div className="space-y-6 max-w-6xl mx-auto dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Payment Audit</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track transaction status, history, and payment logs for NGO contributions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdminOrStaff && (
            <NgoPayoutConfigDialog />
          )}
          {isAdminOrStaff && selectedPayments.size > 0 && (
            <Button onClick={handleBatchDisburse} disabled={isBatchDisbursing} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Send className="w-4 h-4" />
              Batch Disburse ({selectedPayments.size})
            </Button>
          )}
          <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Admin Payout Forecast Trends and Threshold Alerts Section */}
      {isAdminOrStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Historical Trends Forecasting Chart (Recharts) */}
          <Card className="lg:col-span-2 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    6-Month Historical Payout Trends
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">Fluctuations and projections of gross donations vs net payouts.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line name="Gross Donations" type="monotone" dataKey="Gross" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line name="Net Payouts to NGOs" type="monotone" dataKey="NetPayout" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Automated Risk Threshold Panel */}
          <Card className="border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Payout Risk Guardrails
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Configure automated safety alert rules for NGO fee structures.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              {/* Threshold Rule Controls */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-slate-950 p-3 rounded-lg border border-gray-100 dark:border-slate-800/50">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Max Platform Fee (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={feeThreshold}
                    onChange={(e) => setFeeThreshold(Math.max(1, Number(e.target.value)))}
                    className="w-full h-8 px-2 text-xs rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Min Payout Guard (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    value={minPayoutThreshold}
                    onChange={(e) => setMinPayoutThreshold(Math.max(1000, Number(e.target.value)))}
                    className="w-full h-8 px-2 text-xs rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              {/* Live Alerts Stream */}
              <div className="flex-1 overflow-y-auto max-h-48 mt-2 space-y-2 pr-1">
                {loadingAlerts ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500 gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Evaluating platform fees...
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-6 text-center text-xs text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle className="w-8 h-8 mb-1.5 text-green-500" />
                    All NGO payout settings are safe.
                  </div>
                ) : (
                  alerts.map((alert, i) => (
                    <div 
                      key={alert.charityId || i}
                      className={`p-2.5 rounded border text-xs flex flex-col gap-1 ${
                        alert.riskLevel === 'critical'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50 text-red-800 dark:text-red-300'
                          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      <div className="flex justify-between items-start font-bold">
                        <span className="truncate max-w-[70%]">{alert.charityName}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] px-1 py-0 ${
                            alert.riskLevel === 'critical'
                              ? 'border-red-200 bg-red-100 dark:bg-red-900 text-red-800 dark:text-white'
                              : 'border-amber-200 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-white'
                          }`}
                        >
                          {alert.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-1 mt-1 text-[11px]">
                        {alert.triggers.map((trigger: string, idx: number) => (
                          <p key={idx} className="flex items-start gap-1">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>{trigger}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Logs</CardTitle>
          <CardDescription className="dark:text-gray-400">Comprehensive record of all disbursements and payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/30">
                  {isAdminOrStaff && (
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={eligibleForDisbursement.length > 0 && selectedPayments.size === eligibleForDisbursement.length}
                        onCheckedChange={handleSelectAll}
                        disabled={eligibleForDisbursement.length === 0}
                      />
                    </TableHead>
                  )}
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient (NGO)</TableHead>
                  {isAdminOrStaff && <TableHead>Sender (Company)</TableHead>}
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Routing Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="text-xs text-gray-500">Retrieving audit ledgers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-12 text-gray-500">No transactions found.</TableCell></TableRow>
                ) : (
                  payments.map(payment => (
                    <TableRow key={payment.id} className="border-b dark:border-slate-800 hover:bg-gray-50/40 dark:hover:bg-slate-800/30">
                      {isAdminOrStaff && (
                        <TableCell>
                          {payment.status === 'completed' && payment.routingMode === 'Via Platform' && !payment.platformDisbursed && (
                            <Checkbox 
                              checked={selectedPayments.has(payment.id)}
                              onCheckedChange={(c) => handleSelectOne(!!c, payment.id)}
                            />
                          )}
                        </TableCell>
                      )}
                      <TableCell className="font-mono text-xs text-gray-500">{payment.id}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium text-gray-800 dark:text-gray-200">{payment.ngoName}</TableCell>
                      {isAdminOrStaff && <TableCell className="text-gray-600 dark:text-gray-300">{payment.companyName}</TableCell>}
                      <TableCell className="font-semibold text-gray-900 dark:text-white">₹{(payment.amount || 0).toLocaleString()}</TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[11px] bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40">
                          {payment.routingMode || payment.paymentMode || 'direct'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.status === 'completed' && !payment.platformDisbursed && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-400"><CheckCircle className="w-3 h-3 mr-1"/> Received</Badge>}
                        {payment.status === 'completed' && payment.platformDisbursed && <Badge className="bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950 dark:text-sky-400"><CheckCircle className="w-3 h-3 mr-1"/> Disbursed</Badge>}
                        {payment.status === 'pending' && <Badge className="bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:text-amber-400"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                        {payment.status === 'failed' && <Badge className="bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950 dark:text-rose-400"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>}
                      </TableCell>
                      <TableCell>
                        {isAdminOrStaff && 
                         payment.status === 'completed' && 
                         payment.routingMode === 'Via Platform' && 
                         !payment.platformDisbursed && (
                          <Button size="sm" onClick={() => handleDisburse(payment.id)} className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs font-semibold px-3">
                            <Send className="w-3.5 h-3.5 mr-1.5"/> Disburse
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
