import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

const routeConfig = [
  { path: '/', description: 'Landing Page & Role Selection', roles: ['Public'], type: 'public' },
  { path: '/admin/*', description: 'Platform Admin Dashboard & Settings', roles: ['platform_admin'], type: 'protected' },
  { path: '/company/*', description: 'Company Admin Portal (Projects, Engagement, Campaigns)', roles: ['company_admin', 'platform_admin'], type: 'protected' },
  { path: '/employee/*', description: 'Employee Portal (Discover, Impact, Challenges)', roles: ['employee', 'company_admin', 'platform_admin'], type: 'protected' },
  { path: '/onboarding/company', description: 'Company Setup & Registration', roles: ['Authenticated (Any)'], type: 'authenticated' },
];

export function AccessAudit() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <CardTitle>Access Audit Log</CardTitle>
        </div>
        <CardDescription>
          Verify the current route protections and role-based access control (RBAC) applied across the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Path</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Protection Type</TableHead>
                <TableHead>Allowed Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routeConfig.map((route, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{route.path}</TableCell>
                  <TableCell>{route.description}</TableCell>
                  <TableCell>
                    {route.type === 'public' && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Public</Badge>}
                    {route.type === 'protected' && <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-200">Protected</Badge>}
                    {route.type === 'authenticated' && <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Authenticated</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {route.roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
