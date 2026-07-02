import re
with open('src/pages/CompanyEngagement.tsx', 'r') as f:
    content = f.read()

imports = """import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';
import { Loader2 } from 'lucide-react';"""

new_component = """export function CompanyEngagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([
    { name: 'Engineering', total: 150, active: 85, donated: 450000, hours: 820 },
    { name: 'Sales', total: 120, active: 40, donated: 280000, hours: 310 },
    { name: 'Marketing', total: 60, active: 45, donated: 150000, hours: 520 },
    { name: 'HR & Ops', total: 40, active: 38, donated: 95000, hours: 640 },
  ]);

  useEffect(() => {
    if (user) {
      // Simulate fetch
      setTimeout(() => setLoading(false), 500);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Engagement</h1>
        <p className="text-gray-500 mt-1">Detailed view of how employees are interacting with CSR initiatives.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : (
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
                {departments.map((dept, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="text-right">{dept.total}</TableCell>
                    <TableCell className="text-right">{dept.active}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={Math.round((dept.active / dept.total) * 100) > 50 ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'}>
                        {Math.round((dept.active / dept.total) * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{dept.donated.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{dept.hours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}"""

content = re.sub(r'import \{ Card.*?from \'@/components/ui/badge\';', imports, content, flags=re.DOTALL)
content = re.sub(r'export function CompanyEngagement\(\) \{.*', new_component, content, flags=re.DOTALL)

with open('src/pages/CompanyEngagement.tsx', 'w') as f:
    f.write(content)
