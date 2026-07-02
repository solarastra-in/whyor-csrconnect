import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Users, Upload, CheckCircle, Search, Edit2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

const mockEmployees = [
  { id: 'E001', name: 'John Doe', email: 'john.doe@example.com', allocated: 50000, utilized: 12500, type: 'Standard' },
  { id: 'E002', name: 'Jane Smith', email: 'jane.smith@example.com', allocated: 75000, utilized: 75000, type: 'Executive' },
  { id: 'E003', name: 'Rahul Sharma', email: 'rahul.s@example.com', allocated: 50000, utilized: 0, type: 'Standard' },
  { id: 'E004', name: 'Priya Patel', email: 'priya.p@example.com', allocated: 50000, utilized: 20000, type: 'Standard' },
  { id: 'E005', name: 'Amit Kumar', email: 'amit.k@example.com', allocated: 100000, utilized: 45000, type: 'Custom' },
];

export function CompanyGivingBudgets() {
  const [globalAmount, setGlobalAmount] = useState('50000');
  const [frequency, setFrequency] = useState('annually');
  const [budgetType, setBudgetType] = useState('stipend');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = mockEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Giving Budgets & Stipends</h1>
          <p className="text-gray-500 mt-1">Manage employee giving accounts, company match limits, and charitable stipends.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-200">
            <Upload className="w-4 h-4 mr-2" /> Bulk Import
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Total Budget Allocated</CardTitle>
            <Wallet className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹3,25,000</div>
            <p className="text-xs text-gray-500 mt-1">For 5 active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Total Utilized</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹1,52,500</div>
            <p className="text-xs text-green-600 mt-1">46.9% utilization rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Active Participants</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4 / 5</div>
            <p className="text-xs text-blue-600 mt-1">80% participation rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="policy">Global Policy</TabsTrigger>
          <TabsTrigger value="employees">Employee Allocations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="policy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Giving Policy</CardTitle>
              <CardDescription>Set the standard allocation rules applied to all employees by default.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Budget Type</Label>
                  <Select value={budgetType} onValueChange={setBudgetType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stipend">Charitable Stipend (Company pays 100%)</SelectItem>
                      <SelectItem value="match">Donation Matching (Company matches up to limit)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {budgetType === 'stipend' 
                      ? 'Employees are given a balance to donate to any approved charity without spending their own money.'
                      : "The company will match the employee's personal donations up to the allocated limit."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annually">Annually</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Standard Amount per Employee (₹)</Label>
                  <Input 
                    type="number" 
                    value={globalAmount} 
                    onChange={(e) => setGlobalAmount(e.target.value)} 
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Rollover Unused Funds</h4>
                    <p className="text-sm text-gray-500">Allow employees to roll over unused funds to the next period.</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Auto-Enrolment</h4>
                    <p className="text-sm text-gray-500">Automatically apply this policy to new employees when they join.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-end py-4 rounded-b-xl">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Apply to All Standard Employees</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees" className="mt-6">
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Employee Allocations</CardTitle>
                  <CardDescription>View and override budgets for specific employees.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search employees..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Allocated (₹)</TableHead>
                      <TableHead className="text-right">Utilized (₹)</TableHead>
                      <TableHead className="w-[150px]">Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900">{emp.name}</div>
                          <div className="text-xs text-gray-500">{emp.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={emp.type === 'Standard' ? 'bg-gray-50' : 'bg-indigo-50 text-indigo-700'}>
                            {emp.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-900">
                          {emp.allocated.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          {emp.utilized.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(emp.utilized / emp.allocated) * 100} className="h-2 w-full" />
                            <span className="text-xs text-gray-500 w-8">{Math.round((emp.utilized / emp.allocated) * 100)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Edit</span>
                            <Edit2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No employees found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
