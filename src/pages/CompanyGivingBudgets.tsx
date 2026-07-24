import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Users, Upload, CheckCircle, Search, Edit2, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

export function CompanyGivingBudgets() {
  const { user, roleInfo } = useAuth();
  const [globalAmount, setGlobalAmount] = useState('50000');
  const [frequency, setFrequency] = useState('annually');
  const [budgetType, setBudgetType] = useState('matching');
  const [matchRatio, setMatchRatio] = useState('1:1');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [realMetrics, setRealMetrics] = useState({
    totalAllocated: 500000,
    totalUtilized: 0,
    donorCount: 0,
    avgPerUser: 0
  });

  useEffect(() => {
    if (user?.email) {
      fetchBudgetConfig();
    }
  }, [user]);

  const fetchBudgetConfig = async () => {
    try {
      setLoading(true);
      const companyId = roleInfo?.company?.id || user?.email?.split('@')[1];
      if (!companyId) return;
      
      const docRef = doc(db, 'companies', companyId, 'config', 'budgets');
      const docSnap = await getDoc(docRef);
      
      let currentGlobal = '50000';
      if (docSnap.exists()) {
        const data = docSnap.data();
        currentGlobal = data.amount || '50000';
        setGlobalAmount(currentGlobal);
        setFrequency(data.frequency || 'annually');
        setBudgetType(data.type || 'matching');
        setMatchRatio(data.matchRatio || '1:1');
      }

      // Fetch real company payments
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const paymentsSnap = await getDocs(collection(db, 'payments'));
      const companyPayments = paymentsSnap.docs
        .map(d => d.data())
        .filter((p: any) => p.companyId === companyId || !companyId);

      // Fetch real employees for this company
      let usersQuery = query(collection(db, 'users'), where('companyId', '==', companyId));
      let usersSnap = await getDocs(usersQuery);
      let usersList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (usersList.length === 0) {
        // Fallback: fetch all users or use current user as representative employee
        const allUsersSnap = await getDocs(collection(db, 'users'));
        usersList = allUsersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      const allocatedPerEmp = Number(currentGlobal) || 50000;
      const formattedEmps = usersList.map((emp: any) => {
        const userPayments = companyPayments.filter((p: any) => p.userId === emp.id || p.email === emp.email);
        const userUtilized = userPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        return {
          id: emp.id || emp.email,
          name: emp.name || emp.displayName || emp.email?.split('@')[0] || 'Employee User',
          email: emp.email || 'employee@company.com',
          type: 'Global Default',
          allocated: allocatedPerEmp,
          utilized: userUtilized
        };
      });

      setEmployees(formattedEmps);

      const utilized = companyPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const donors = new Set(companyPayments.map((p: any) => p.userId || p.email)).size;
      const allocated = allocatedPerEmp * Math.max(1, formattedEmps.length);

      setRealMetrics({
        totalAllocated: allocated,
        totalUtilized: utilized,
        donorCount: donors,
        avgPerUser: donors > 0 ? Math.round(utilized / donors) : 0
      });
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveBudgetConfig = async () => {
    try {
      setSaving(true);
      const companyId = roleInfo?.company?.id || user?.email?.split('@')[1];
      if (!companyId) {
        toast.error("Could not determine company");
        return;
      }
      
      const docRef = doc(db, 'companies', companyId, 'config', 'budgets');
      await setDoc(docRef, {
        amount: globalAmount,
        frequency,
        type: budgetType,
        matchRatio,
        updatedAt: new Date(),
        updatedBy: user?.email
      }, { merge: true });
      
      toast.success('Budget configuration & match multiplier saved.');
    } catch(e) {
      console.error(e);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Giving Budgets</h1>
          <p className="text-gray-500 mt-1">Manage employee giving stipends and matching limits.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white">
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Allocate Funds
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Global Budget Rules</CardTitle>
            <CardDescription>Set the default allocation for all new and existing employees.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Amount (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                      <Input 
                        className="pl-8" 
                        type="number" 
                        value={globalAmount} 
                        onChange={(e) => setGlobalAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Budget Type & Match Multiplier</Label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="budget_type" 
                        checked={budgetType === 'stipend'}
                        onChange={() => setBudgetType('stipend')}
                        className="mt-1" 
                      />
                      <div>
                        <div className="font-medium">Direct Stipend</div>
                        <div className="text-sm text-gray-500">Company pays directly. Employees allocate where it goes.</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="budget_type" 
                        checked={budgetType === 'matching'}
                        onChange={() => setBudgetType('matching')}
                        className="mt-1" 
                      />
                      <div className="flex-1">
                        <div className="font-medium">Matching Cap</div>
                        <div className="text-sm text-gray-500">Maximum amount the company will match for employee donations.</div>
                      </div>
                    </label>
                  </div>

                  {budgetType === 'matching' && (
                    <div className="pt-3 space-y-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                      <Label className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Corporate Match Multiplier Ratio</Label>
                      <Select value={matchRatio} onValueChange={setMatchRatio}>
                        <SelectTrigger className="bg-white border-indigo-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1:1">1 : 1 Standard Match (Company matches 100% of employee donation)</SelectItem>
                          <SelectItem value="2:1">2 : 1 Double Match (Company contributes $2 for every $1 donated)</SelectItem>
                          <SelectItem value="0.5:1">0.5 : 1 Partial Match (Company contributes 50% match)</SelectItem>
                          <SelectItem value="3:1">3 : 1 Triple Executive Impact Match (Company contributes $3 for every $1)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-indigo-700/80">
                        Selected Ratio: <span className="font-bold">{matchRatio}</span> multiplier will automatically calculate corporate funds for every employee pledge.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50/50 border-t justify-end py-4">
            <Button onClick={saveBudgetConfig} disabled={saving || loading}>
              {saving ? 'Saving...' : 'Apply Global Rules'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Current fiscal year utilization from Firestore</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Total Allocated</span>
                <span className="font-bold text-gray-900">₹{realMetrics.totalAllocated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Total Utilized</span>
                <span className="font-bold text-blue-600">₹{realMetrics.totalUtilized.toLocaleString()}</span>
              </div>
              <Progress value={Math.min(100, Math.round((realMetrics.totalUtilized / (realMetrics.totalAllocated || 1)) * 100))} className="h-2 mt-4" />
              <p className="text-xs text-center text-gray-500 mt-2">
                {Math.min(100, Math.round((realMetrics.totalUtilized / (realMetrics.totalAllocated || 1)) * 100))}% utilization rate
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-700">{realMetrics.donorCount}</div>
                  <div className="text-xs text-blue-600">Active Donors</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-700">₹{realMetrics.avgPerUser.toLocaleString()}</div>
                  <div className="text-xs text-green-600">Avg. per user</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Budgets</CardTitle>
          <CardDescription>Manage individual allocation and view utilization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search employees..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Rule Type</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Utilized</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={emp.type === 'Custom' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50'}>
                        {emp.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{emp.allocated.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm">₹{emp.utilized.toLocaleString()}</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(emp.utilized / emp.allocated) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => toast('Edit individual budget')}>
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}