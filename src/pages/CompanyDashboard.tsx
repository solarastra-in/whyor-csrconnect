import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { Users, IndianRupee, Target, Settings, Link as LinkIcon, ShieldCheck, SlidersHorizontal, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { CSREventsCalendar } from '@/src/components/CSREventsCalendar';

const mockEngagementData: any[] = [];

export function CompanyDashboard() {
  const [widgets, setWidgets] = useState({
    participation: true,
    fundsMatched: true,
    volunteerHours: true,
    activeCampaigns: true,
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('csrDashboardWidgets');
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        // use default
      }
    }
  }, []);

  const toggleWidget = (key: keyof typeof widgets) => {
    const next = { ...widgets, [key]: !widgets[key] };
    setWidgets(next);
    localStorage.setItem('csrDashboardWidgets', JSON.stringify(next));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Overview</h1>
          <p className="text-gray-500">Track employee engagement and manage platform settings.</p>
        </div>
        <div className="flex space-x-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Customize Widgets
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm leading-none mb-3">Dashboard Widgets</h4>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="w-participation" className="flex flex-col space-y-1">
                    <span>Employee Participation</span>
                  </Label>
                  <Switch 
                    id="w-participation" 
                    checked={widgets.participation}
                    onCheckedChange={() => toggleWidget('participation')}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="w-funds" className="flex flex-col space-y-1">
                    <span>Funds Matched</span>
                  </Label>
                  <Switch 
                    id="w-funds" 
                    checked={widgets.fundsMatched}
                    onCheckedChange={() => toggleWidget('fundsMatched')}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="w-hours" className="flex flex-col space-y-1">
                    <span>Total Volunteer Hours</span>
                  </Label>
                  <Switch 
                    id="w-hours" 
                    checked={widgets.volunteerHours}
                    onCheckedChange={() => toggleWidget('volunteerHours')}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="w-campaigns" className="flex flex-col space-y-1">
                    <span>Active Campaigns</span>
                  </Label>
                  <Switch 
                    id="w-campaigns" 
                    checked={widgets.activeCampaigns}
                    onCheckedChange={() => toggleWidget('activeCampaigns')}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-700">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.participation && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employee Participation</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                +12% from last quarter
              </p>
            </CardContent>
          </Card>
        )}
        {widgets.fundsMatched && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funds Matched</CardTitle>
              <IndianRupee className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹12.4L</div>
              <p className="text-xs text-gray-500 mt-1">
                of ₹50L annual budget
              </p>
            </CardContent>
          </Card>
        )}
        {widgets.volunteerHours && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volunteer Hours</CardTitle>
              <Target className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4,250</div>
              <p className="text-xs text-gray-500 mt-1">
                across 15 initiatives
              </p>
            </CardContent>
          </Card>
        )}
        {widgets.activeCampaigns && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-500 mt-1">
                2 ending this month
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="analytics">Analytics & Impact</TabsTrigger>
          <TabsTrigger value="events">Events Calendar</TabsTrigger>
          <TabsTrigger value="approvals">Nomination Approvals</TabsTrigger>
          <TabsTrigger value="integration">SSO & Integration</TabsTrigger>
          <TabsTrigger value="matching">Matching Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Nominated Projects</CardTitle>
              <CardDescription>Review and approve projects nominated by employees before they are sent to the Platform Admin for final validation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Local Community Clean-up</h3>
                    <p className="text-sm text-gray-500">Nominated by: John Doe (john.doe@company.com)</p>
                    <p className="text-xs text-gray-400 mt-1">Submitted: 2 days ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Approve & Send to Portal Admin</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Tech for Kids Workshop</h3>
                    <p className="text-sm text-gray-500">Nominated by: Sarah Smith (sarah.s@company.com)</p>
                    <p className="text-xs text-gray-400 mt-1">Submitted: 5 days ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Approve & Send to Portal Admin</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Engagement Trend</CardTitle>
              <CardDescription>Percentage of workforce actively donating or volunteering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockEngagementData}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="participation" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <CSREventsCalendar />
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Single Sign-On (SSO)</CardTitle>
              <CardDescription>Configure SAML/OIDC for seamless employee access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-4">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Azure Active Directory</h3>
                    <p className="text-sm text-gray-500">Status: <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge></p>
                  </div>
                </div>
                <button className="text-sm font-medium text-gray-600 border px-3 py-1.5 rounded hover:bg-gray-100">Configure</button>
              </div>
              <div className="p-4 border rounded-lg border-dashed text-center">
                <LinkIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Add New Identity Provider</h3>
                <p className="text-xs text-gray-500 mt-1">Support for Okta, Google Workspace, and generic SAML 2.0</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Corporate Matching Settings</CardTitle>
              <CardDescription>Define how employee donations are matched by the company.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Global Match Ratio</p>
                    <p className="text-2xl font-bold mt-1">1:1</p>
                    <p className="text-xs text-gray-500 mt-1">Company matches 100% of employee donation</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Annual Limit per Employee</p>
                    <p className="text-2xl font-bold mt-1">₹50,000</p>
                    <p className="text-xs text-gray-500 mt-1">Resets Jan 1st</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Special Campaigns</h4>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold">2:1 Match</span> - Disaster Relief Fund (Kerala)
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
