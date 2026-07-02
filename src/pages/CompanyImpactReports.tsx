import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, PieChart, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { ProjectPerformanceAnalytics } from '@/src/components/ProjectPerformanceAnalytics';

const monthlyImpactData = [
  { month: 'Jan', hours: 450, donations: 25000 },
  { month: 'Feb', hours: 520, donations: 32000 },
  { month: 'Mar', hours: 480, donations: 28000 },
  { month: 'Apr', hours: 610, donations: 41000 },
  { month: 'May', hours: 590, donations: 38000 },
  { month: 'Jun', hours: 720, donations: 45000 },
];

export function CompanyImpactReports() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Impact Reports</h1>
          <p className="text-gray-500 mt-1">Analyze and export your company's CSR impact data.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => toast.success('Annual Report downloading...')}>
          <Download className="h-4 w-4" /> Download Annual Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteer Hours</CardTitle>
            <PieChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,370h</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +14% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matched Donations</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,09,000</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +21% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Participation</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +5% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <ProjectPerformanceAnalytics />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Hours Trend</CardTitle>
            <CardDescription>Monthly volunteer hours over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyImpactData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ stroke: '#e5e7eb', strokeWidth: 2, fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>Recently generated and scheduled reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Q2 2026 CSR Impact Summary', date: 'Jul 1, 2026', type: 'PDF' },
              { name: 'June 2026 Volunteer Logs', date: 'Jul 1, 2026', type: 'CSV' },
              { name: 'Environmental Campaign Report', date: 'Jun 15, 2026', type: 'PDF' },
              { name: 'Q1 2026 CSR Impact Summary', date: 'Apr 1, 2026', type: 'PDF' },
            ].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.name}</p>
                    <p className="text-xs text-gray-500">{report.date} &middot; {report.type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.success(`Downloading ${report.name}...`)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
