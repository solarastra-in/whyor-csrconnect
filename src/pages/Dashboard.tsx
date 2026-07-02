import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartHandshake, Building2, Users, IndianRupee } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { SecurityAuditLog } from '@/src/components/SecurityAuditLog';

const mockChartData = [
  { month: 'Jan', donations: 4000 },
  { month: 'Feb', donations: 3000 },
  { month: 'Mar', donations: 2000 },
  { month: 'Apr', donations: 2780 },
  { month: 'May', donations: 1890 },
  { month: 'Jun', donations: 2390 },
  { month: 'Jul', donations: 3490 },
  { month: 'Aug', donations: 4500 },
  { month: 'Sep', donations: 5000 },
  { month: 'Oct', donations: 6000 },
  { month: 'Nov', donations: 7200 },
  { month: 'Dec', donations: 8400 },
];

const topProjects = [
  { id: 1, name: 'Clean Ganga Initiative', charity: 'Jal Foundation', funds: '₹2.4 Cr', progress: 85 },
  { id: 2, name: 'Rural Education Drive', charity: 'Vidya Trust', funds: '₹1.2 Cr', progress: 60 },
  { id: 3, name: 'Solar for Villages', charity: 'Green Future', funds: '₹85 Lakhs', progress: 40 },
];

export function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
        <p className="text-gray-500">Real-time impact and engagement metrics across the network.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CSR Funds</CardTitle>
            <IndianRupee className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹42.5 Cr</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Charities</CardTitle>
            <HeartHandshake className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-gray-500 mt-1">
              across 24 states
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div>
            <p className="text-xs text-gray-500 mt-1">
              12 new this quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Volunteers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-gray-500 mt-1">
              45k+ hours logged
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
                <AreaChart data={mockChartData}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}k`}
                  />
                  <Tooltip />
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
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Validations (Nominated)</CardTitle>
            <CardDescription>Review and validate projects approved by companies before they are published to employees.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Local Community Clean-up</h3>
                    <p className="text-sm text-gray-500">Company: Acme Corp</p>
                    <p className="text-xs text-gray-400 mt-1">Approved by Company Admin: 2 hours ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Validate & Publish</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Tech for Kids Workshop</h3>
                    <p className="text-sm text-gray-500">Company: Global Tech</p>
                    <p className="text-xs text-gray-400 mt-1">Approved by Company Admin: 5 hours ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Validate & Publish</Button>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
        
        <SecurityAuditLog />
      </div>
    </div>
  );
}
