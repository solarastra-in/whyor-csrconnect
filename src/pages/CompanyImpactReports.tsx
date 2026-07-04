import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, PieChart, TrendingUp, Users, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { ProjectPerformanceAnalytics } from '@/src/components/ProjectPerformanceAnalytics';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

export function CompanyImpactReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 24500,
    totalDonations: 840000,
    employeeParticipation: 68
  });

  const monthlyImpactData = [
    { month: 'Jan', hours: 450, donations: 25000 },
    { month: 'Feb', hours: 520, donations: 32000 },
    { month: 'Mar', hours: 480, donations: 28000 },
    { month: 'Apr', hours: 610, donations: 41000 },
    { month: 'May', hours: 590, donations: 38000 },
    { month: 'Jun', hours: 720, donations: 45000 },
  ];

  useEffect(() => {
    if (user) fetchImpactData();
  }, [user]);

  const fetchImpactData = async () => {
    try {
      setLoading(true);
      // In a real app, we would query the ledger or aggregated stats per company
      // For demo, we'll just simulate a delay
      await new Promise(r => setTimeout(r, 800));
      // Leaving mock data for visualization, but ready for real data wiring
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const reportText = `
ANNUAL IMPACT REPORT
-------------------
Total Volunteer Hours: ${stats.totalHours.toLocaleString()}
Total Matched Donations: ₹${stats.totalDonations.toLocaleString()}
Employee Participation: ${stats.employeeParticipation}%

Generated on: ${new Date().toLocaleDateString()}
    `;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Company_Impact_Report_${new Date().getFullYear()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Annual Report downloaded successfully');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Impact Reports</h1>
          <p className="text-gray-500 mt-1">Analyze and export your company's CSR impact data.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleDownload} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download Annual Report
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">+12% y/y</Badge>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalHours.toLocaleString()}</h3>
                <p className="text-sm text-gray-500">Total Volunteer Hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">+8% y/y</Badge>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{stats.totalDonations.toLocaleString()}</h3>
                <p className="text-sm text-gray-500">Total Matched Donations</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">+2% y/y</Badge>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.employeeParticipation}%</h3>
                <p className="text-sm text-gray-500">Employee Participation</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Impact Growth (YTD)</CardTitle>
                <CardDescription>Volunteer hours and donations over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyImpactData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Hours" />
                      <Line yAxisId="right" type="monotone" dataKey="donations" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Donations (₹)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <ProjectPerformanceAnalytics />
          </div>
        </>
      )}
    </div>
  );
}