import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const grants = [
  {
    id: 'GR-2023-01',
    ngo: 'Jal Foundation',
    project: 'Clean Ganga Initiative',
    amountRequested: 5000000,
    status: 'pending',
    date: '2023-10-15',
    category: 'Environment'
  },
  {
    id: 'GR-2023-02',
    ngo: 'Digital Literacy Trust',
    project: 'Rural Tech Education',
    amountRequested: 2500000,
    status: 'approved',
    date: '2023-09-22',
    category: 'Education'
  },
  {
    id: 'GR-2023-03',
    ngo: 'Food for All',
    project: 'Urban Food Banks',
    amountRequested: 1000000,
    status: 'rejected',
    date: '2023-08-10',
    category: 'Poverty'
  }
];

export function CompanyGrants() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Corporate Grantmaking</h1>
          <p className="text-gray-500 mt-1">Review grant applications from NGOs, allocate funds, and track outcomes.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toast.success('Grant cycle creation would open here')}>Create Grant Cycle</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Grants Budget</CardDescription>
            <CardTitle className="text-2xl">₹10,000,000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">FY 2023-2024</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Funds Allocated</CardDescription>
            <CardTitle className="text-2xl text-green-600">₹2,500,000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">25% of total budget</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-2xl text-amber-600">₹5,000,000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">1 application pending review</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Grant Applications</CardTitle>
          <CardDescription>Manage incoming requests from onboarded NGOs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>NGO & Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grants.map((grant) => (
                <TableRow key={grant.id}>
                  <TableCell className="font-mono text-xs">{grant.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{grant.ngo}</div>
                    <div className="text-xs text-gray-500">{grant.project}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{grant.category}</Badge>
                  </TableCell>
                  <TableCell>{grant.amountRequested.toLocaleString()}</TableCell>
                  <TableCell>
                    {grant.status === 'pending' && <Badge variant="secondary" className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                    {grant.status === 'approved' && <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>}
                    {grant.status === 'rejected' && <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="h-8"><FileText className="w-4 h-4 mr-1"/> View Pitch</Button>
                      {grant.status === 'pending' && (
                        <Button variant="default" size="sm" className="h-8 bg-blue-600" onClick={() => toast.success('Grant review submitted successfully')}>Review</Button>
                      )}
                    </div>
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
