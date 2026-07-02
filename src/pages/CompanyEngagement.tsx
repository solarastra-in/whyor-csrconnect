import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function CompanyEngagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Engagement</h1>
        <p className="text-gray-500 mt-1">Detailed view of how employees are interacting with CSR initiatives.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Breakdown</CardTitle>
          <CardDescription>Participation metrics across different teams</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Total Employees</TableHead>
                <TableHead className="text-right">Active Participants</TableHead>
                <TableHead className="text-right">Participation Rate</TableHead>
                <TableHead className="text-right">Total Donated</TableHead>
                <TableHead className="text-right">Vol Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { dept: 'Engineering', total: 450, active: 320, donated: '₹4.5L', hours: 850 },
                { dept: 'Sales', total: 200, active: 150, donated: '₹5.2L', hours: 320 },
                { dept: 'Marketing', total: 120, active: 95, donated: '₹1.8L', hours: 410 },
                { dept: 'HR & Admin', total: 50, active: 45, donated: '₹0.9L', hours: 250 },
              ].map((row) => (
                <TableRow key={row.dept}>
                  <TableCell className="font-medium">{row.dept}</TableCell>
                  <TableCell className="text-right">{row.total}</TableCell>
                  <TableCell className="text-right">{row.active}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {Math.round((row.active / row.total) * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{row.donated}</TableCell>
                  <TableCell className="text-right">{row.hours}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
