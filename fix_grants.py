import re
with open('src/pages/CompanyGrants.tsx', 'r') as f:
    content = f.read()

# Add standard hooks and firebase imports
imports = """import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';"""

content = re.sub(r'import \{ Card.*?lucide-react\';', imports, content, flags=re.DOTALL)

# Add Firebase logic
component = """export function CompanyGrants() {
  const { user } = useAuth();
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newGrant, setNewGrant] = useState({ project: '', ngo: '', amountRequested: 0, category: '' });

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      const q = query(collection(db, 'grants'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedGrants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGrants(fetchedGrants);
    } catch (error) {
      console.error("Error fetching grants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrant = async () => {
    if (!newGrant.project || !newGrant.ngo || newGrant.amountRequested <= 0) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await addDoc(collection(db, 'grants'), {
        ...newGrant,
        status: 'pending',
        date: new Date().toISOString(),
        companyId: user?.uid || 'company'
      });
      toast.success('Grant cycle created!');
      setIsCreating(false);
      fetchGrants();
    } catch (e) {
      toast.error('Failed to create grant');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'grants', id), { status: newStatus });
      toast.success(`Grant ${newStatus}!`);
      fetchGrants();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };"""

content = re.sub(r'const grants = \[.*?\];\n\nexport function CompanyGrants\(\) \{', component, content, flags=re.DOTALL)

# Modify Create button
content = content.replace('<Button>Create Grant Cycle</Button>', """<Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Grant Cycle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Grant</DialogTitle>
              <DialogDescription>Initiate a new grant for an NGO project.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={newGrant.project} onChange={(e) => setNewGrant({...newGrant, project: e.target.value})} placeholder="e.g. Clean River Initiative" />
              </div>
              <div className="space-y-2">
                <Label>NGO Name</Label>
                <Input value={newGrant.ngo} onChange={(e) => setNewGrant({...newGrant, ngo: e.target.value})} placeholder="e.g. Green Earth" />
              </div>
              <div className="space-y-2">
                <Label>Amount Requested (₹)</Label>
                <Input type="number" value={newGrant.amountRequested} onChange={(e) => setNewGrant({...newGrant, amountRequested: Number(e.target.value)})} placeholder="500000" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={newGrant.category} onChange={(e) => setNewGrant({...newGrant, category: e.target.value})} placeholder="e.g. Environment" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreateGrant}>Create Grant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>""")

# Add Approve/Reject buttons to rows
content = content.replace("""                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Review</Button>
                  </TableCell>""", """                  <TableCell className="text-right space-x-2">
                    {grant.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(grant.id, 'approved')}><CheckCircle className="h-4 w-4 mr-1"/> Approve</Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(grant.id, 'rejected')}><XCircle className="h-4 w-4 mr-1"/> Reject</Button>
                      </>
                    )}
                  </TableCell>""")

content = content.replace("            <TableBody>\n              {grants.map((grant) => (", """            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">Loading grants...</TableCell>
                </TableRow>
              ) : grants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">No grants found.</TableCell>
                </TableRow>
              ) : grants.map((grant) => (""")

# Close the map properly
content = content.replace("              ))}\n            </TableBody>", "              ))}\n            </TableBody>")

with open('src/pages/CompanyGrants.tsx', 'w') as f:
    f.write(content)
