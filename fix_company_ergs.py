import re
with open('src/pages/CompanyERGs.tsx', 'r') as f:
    content = f.read()

imports = """import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, PlusCircle, BarChart3, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';"""

new_component = """export function CompanyERGs() {
  const [ergs, setErgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchERGs();
  }, []);

  const fetchERGs = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'ergs'));
      const ergsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setErgs(ergsData);
    } catch (error) {
      console.error("Error fetching ERGs:", error);
      toast.error("Failed to load ERGs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateERG = async () => {
    try {
      const newERG = {
        name: 'New ERG ' + Math.floor(Math.random() * 1000),
        description: 'Newly created ERG',
        lead: 'Pending Assignment',
        members: [],
        budgetAllocated: 10000,
        budgetSpent: 0,
        status: 'active',
        tags: ['New']
      };
      await addDoc(collection(db, 'ergs'), newERG);
      toast.success('New ERG created');
      fetchERGs();
    } catch(e) {
      console.error(e);
      toast.error('Failed to create ERG');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ERG Management</h1>
          <p className="text-gray-500 mt-1">Oversee and support your company's Employee Resource Groups.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateERG}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New ERG
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active ERGs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ergs.length}</div>
            <p className="text-xs text-gray-500 mt-1">+1 from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ERG Budget</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{ergs.reduce((acc, erg) => acc + (erg.budgetAllocated || 0), 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Annual allocation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const totalAlloc = ergs.reduce((acc, erg) => acc + (erg.budgetAllocated || 0), 0);
                const totalSpent = ergs.reduce((acc, erg) => acc + (erg.budgetSpent || 0), 0);
                return totalAlloc > 0 ? Math.round((totalSpent / totalAlloc) * 100) : 0;
              })()}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Of total allocation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ERG Directory</CardTitle>
          <CardDescription>Manage budgets, assign leads, and monitor ERG performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Budget Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">Loading ERGs...</TableCell>
                </TableRow>
              ) : ergs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">No ERGs created yet.</TableCell>
                </TableRow>
              ) : ergs.map((erg) => (
                <TableRow key={erg.id}>
                  <TableCell className="font-medium">{erg.name}</TableCell>
                  <TableCell>{erg.lead || 'Unassigned'}</TableCell>
                  <TableCell>{erg.members?.length || 0}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>₹{(erg.budgetSpent || 0).toLocaleString()}</span>
                        <span className="text-gray-500">of ₹{(erg.budgetAllocated || 0).toLocaleString()}</span>
                      </div>
                      <Progress value={((erg.budgetSpent || 0) / (erg.budgetAllocated || 1)) * 100} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={erg.status === 'active' ? 'default' : 'secondary'} className={erg.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                      {erg.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toast('Opening settings...')}>
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
}"""

content = re.sub(r'import \{ Card.*?from \'sonner\';', imports, content, flags=re.DOTALL)
content = re.sub(r'const ergs = \[.*\];.*?export function CompanyERGs\(\) \{.*\}', new_component, content, flags=re.DOTALL)

with open('src/pages/CompanyERGs.tsx', 'w') as f:
    f.write(content)
