import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const projectPerformanceData = [
  { name: 'Riverbank Cleanup', turnout: 85, target: 100, hours: 340, impactScore: 92 },
  { name: 'Tech for Good', turnout: 120, target: 100, hours: 240, impactScore: 88 },
  { name: 'Tree Plantation', turnout: 60, target: 50, hours: 240, impactScore: 95 },
  { name: 'Senior Care', turnout: 35, target: 40, hours: 140, impactScore: 82 },
  { name: 'Food Drive', turnout: 95, target: 80, hours: 380, impactScore: 96 }
];

export function ProjectPerformanceAnalytics() {
  return (
    <Card className="mt-6 border-indigo-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Project Performance Analytics</CardTitle>
        <CardDescription>
          Visualize volunteer turnout and engagement rates across recent campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Turnout vs Target Chart */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 text-sm">Volunteer Turnout vs Target</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectPerformanceData}
                  margin={{ top: 20, right: 30, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 11 }} 
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Bar dataKey="target" name="Target Attendees" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="turnout" name="Actual Turnout" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Impact Score vs Total Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 text-sm">Total Hours & Impact Score (KPI)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectPerformanceData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }} 
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="hours" name="Total Hours" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="impactScore" name="Impact KPI (0-100)" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
