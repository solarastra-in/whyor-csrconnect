import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, PlusCircle, BarChart3, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const ergs = [
  {
    id: 1,
    name: 'Women in Tech (WiT)',
    lead: 'Sarah Jenkins',
    members: 1240,
    budgetAllocated: 50000,
    budgetSpent: 22000,
    status: 'active'
  },
  {
    id: 2,
    name: 'Green Earth Alliance',
    lead: 'David Chen',
    members: 850,
    budgetAllocated: 30000,
    budgetSpent: 12000,
    status: 'active'
  },
  {
    id: 3,
    name: 'Pride Network',
    lead: 'Alex Rivera',
    members: 920,
    budgetAllocated: 40000,
    budgetSpent: 35000,
    status: 'review'
  }
];

export function CompanyERGs() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Resource Groups (ERGs)</h1>
          <p className="text-gray-500 mt-1">Manage affinity groups, approve budgets, and track ERG engagement across the company.</p>
        </div>
        <Button onClick={() => toast.success('Opening ERG creation form...')} className="bg-indigo-600 hover:bg-indigo-700"><PlusCircle className="w-4 h-4 mr-2" /> Create ERG</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Active ERGs</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-green-600 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> +2 this quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Total Members</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4,521</div>
            <p className="text-xs text-green-600 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> +15% vs last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Total ERG Budget</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹500,000</div>
            <p className="text-xs text-gray-500 mt-1">₹320,000 utilized (64%)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage ERGs</CardTitle>
          <CardDescription>Review group activity, manage leads, and allocate funding.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Budget Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ergs.map((erg) => (
                <TableRow key={erg.id}>
                  <TableCell className="font-medium">{erg.name}</TableCell>
                  <TableCell>{erg.lead}</TableCell>
                  <TableCell>{erg.members.toLocaleString()}</TableCell>
                  <TableCell className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <Progress value={(erg.budgetSpent / erg.budgetAllocated) * 100} className="h-2 w-[100px]" />
                      <span className="text-xs text-gray-500">{Math.round((erg.budgetSpent / erg.budgetAllocated) * 100)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {erg.status === 'active' ? (
                       <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                       <Badge variant="secondary" className="bg-amber-100 text-amber-800">Review Requested</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => toast.success('Opening ERG settings...')} variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <Settings className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
