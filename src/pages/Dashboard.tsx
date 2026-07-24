import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartHandshake, Building2, Users, IndianRupee, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { collection, getDocs, updateDoc, doc, query, where, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { toast } from 'sonner';
import { SecurityAuditLog } from '@/src/components/SecurityAuditLog';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalFunds: '₹0',
    activeCharities: 0,
    partnerCompanies: 0,
    volunteers: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [topProjects, setTopProjects] = useState<any[]>([]);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch charities count
      const charitiesSnap = await getDocs(collection(db, 'charities'));
      const activeCharitiesCount = charitiesSnap.docs.filter(d => d.data().status === 'approved').length;

      // 2. Fetch companies count
      const companiesSnap = await getDocs(collection(db, 'companies'));
      const companiesCount = companiesSnap.size;

      // 3. Fetch users count
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersCount = usersSnap.size;

      // 4. Fetch payments & total funds + monthly aggregation
      const paymentsSnap = await getDocs(collection(db, 'payments'));
      const totalAmount = paymentsSnap.docs.reduce((sum, d) => sum + (Number(d.data().amount) || 0), 0);
      
      let formattedFunds = '₹0';
      if (totalAmount >= 10000000) {
        formattedFunds = `₹${(totalAmount / 10000000).toFixed(2)} Cr`;
      } else if (totalAmount >= 100000) {
        formattedFunds = `₹${(totalAmount / 100000).toFixed(2)} Lakhs`;
      } else if (totalAmount > 0) {
        formattedFunds = `₹${totalAmount.toLocaleString('en-IN')}`;
      }

      setStats({
        totalFunds: formattedFunds,
        activeCharities: activeCharitiesCount,
        partnerCompanies: companiesCount,
        volunteers: usersCount
      });

      // Calculate real monthly chart data from payments
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyMap: Record<string, number> = {};
      const now = new Date();
      
      // Initialize past 6 months with 0
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = monthNames[d.getMonth()];
        monthlyMap[label] = 0;
      }

      paymentsSnap.docs.forEach(doc => {
        const data = doc.data();
        const amt = Number(data.amount) || 0;
        let pDate = new Date();
        if (data.createdAt?.toDate) {
          pDate = data.createdAt.toDate();
        } else if (data.createdAt) {
          pDate = new Date(data.createdAt);
        } else if (data.date) {
          pDate = new Date(data.date);
        }
        const mLabel = monthNames[pDate.getMonth()];
        if (mLabel in monthlyMap) {
          monthlyMap[mLabel] += amt;
        }
      });

      const computedChart = Object.keys(monthlyMap).map(m => ({
        month: m,
        donations: monthlyMap[m]
      }));
      setChartData(computedChart);

      // 5. Fetch Projects for Top Projects & Validation Queue
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const allProjects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Pending validations
      const pendingList = allProjects.filter((p: any) => p.status === 'pending' || p.status === 'pending_verification');
      setPendingProjects(pendingList);

      // Top Projects
      const approvedList = allProjects.filter((p: any) => p.status === 'approved');
      const sorted = approvedList.sort((a: any, b: any) => (b.targetHours || 0) - (a.targetHours || 0)).slice(0, 3);
      setTopProjects(sorted.map((p: any) => {
        const raised = Number(p.raisedAmount) || 0;
        const target = Number(p.targetAmount) || (Number(p.targetHours) ? Number(p.targetHours) * 1000 : 0);
        const progressVal = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : (p.volunteersCount ? Math.min(100, p.volunteersCount * 10) : 0);
        
        let fundsDisplay = '₹0';
        if (raised > 0) {
          fundsDisplay = `₹${raised.toLocaleString('en-IN')}`;
        } else if (target > 0) {
          fundsDisplay = `₹${target.toLocaleString('en-IN')} Target`;
        }

        return {
          id: p.id,
          name: p.title || p.name || 'CSR Initiative',
          charity: p.charityName || 'Partner NGO',
          funds: fundsDisplay,
          progress: progressVal
        };
      }));

    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateProject = async (projectId: string) => {
    try {
      if (!projectId.startsWith('demo-')) {
        await updateDoc(doc(db, 'projects', projectId), { status: 'approved' });
      }
      toast.success('Project validated and published to all partner companies!');
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (e: any) {
      toast.error('Failed to validate project: ' + e.message);
    }
  };

  const handleRejectProject = async (projectId: string) => {
    try {
      if (!projectId.startsWith('demo-')) {
        await updateDoc(doc(db, 'projects', projectId), { status: 'rejected' });
      }
      toast.info('Project nomination rejected.');
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (e: any) {
      toast.error('Failed to reject project: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
        <p className="text-gray-500">Real-time impact, governance, and engagement metrics across the network.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CSR Funds</CardTitle>
            <IndianRupee className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFunds}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalFunds === '₹0' ? 'No contributions logged yet' : 'Total contributions logged'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Charities</CardTitle>
            <HeartHandshake className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCharities}</div>
            <p className="text-xs text-gray-500 mt-1">
              Verified NGOs pan-India
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.partnerCompanies}</div>
            <p className="text-xs text-gray-500 mt-1">
              Corporate CSR partners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Volunteers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.volunteers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              Active impact participants
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Donation Trends</CardTitle>
            <CardDescription>Monthly CSR contributions across all partner companies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value >= 1000 ? `₹${value / 1000}k` : `₹${value}`}
                  />
                  <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Donations']} />
                  <Area type="monotone" dataKey="donations" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Projects</CardTitle>
            <CardDescription>Highest funded initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            {topProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No approved projects yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {topProjects.map((project) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.charity}</p>
                      </div>
                      <div className="text-sm font-medium">{project.funds}</div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Project Validations Queue</span>
              {pendingProjects.length > 0 && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                  {pendingProjects.length} Pending Review
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Review and validate NGO projects before they are published to corporate employees.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {pendingProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800">All Project Validations Clear!</p>
                  <p className="text-xs text-gray-500 mt-1">There are no pending project nominations requiring review.</p>
                </div>
             ) : (
               <div className="space-y-4">
                  {pendingProjects.map((proj) => (
                    <div key={proj.id} className="p-4 border rounded-lg bg-gray-50/60 hover:bg-white transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{proj.title || proj.name}</h3>
                          {proj.category && <Badge variant="outline" className="text-[10px]">{proj.category}</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">
                          NGO: <strong>{proj.charityName || 'Partner NGO'}</strong> {proj.companyName ? `• Nominated by: ${proj.companyName}` : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {proj.createdAtStr || 'Pending Platform Admin Approval'}
                        </p>
                      </div>

                      <div className="flex space-x-2 w-full md:w-auto justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => handleRejectProject(proj.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                        >
                          Reject
                        </Button>
                        <Button 
                          onClick={() => handleValidateProject(proj.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Validate & Publish
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </CardContent>
        </Card>
        
        <SecurityAuditLog />
      </div>
    </div>
  );
}
