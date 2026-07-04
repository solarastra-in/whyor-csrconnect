import re
with open('src/pages/EmployeeERGs.tsx', 'r') as f:
    content = f.read()

imports = """import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Megaphone, Calendar, ArrowRight, HandHeart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';"""

new_component = """export function EmployeeERGs() {
  const [ergs, setErgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // New ERG state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newErgName, setNewErgName] = useState('');
  const [newErgDescription, setNewErgDescription] = useState('');
  const [newErgTags, setNewErgTags] = useState('');

  useEffect(() => {
    fetchERGs();
  }, []);

  const fetchERGs = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'ergs'));
      const ergsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (ergsData.length === 0) {
        setErgs([
          {
            id: 'mock-1',
            name: 'Women in Tech (WiT)',
            description: 'Empowering women across the organization through mentorship, networking, and skill-building.',
            members: ['mock-user-1', 'mock-user-2'],
            budgetAllocated: 50000,
            budgetSpent: 22000,
            tags: ['Diversity', 'Mentorship'],
            featuredEvent: 'Annual Leadership Summit'
          },
          {
            id: 'mock-2',
            name: 'Green Earth Alliance',
            description: 'Sustainability advocates driving environmental initiatives within the company and our local communities.',
            members: [],
            budgetAllocated: 30000,
            budgetSpent: 12000,
            tags: ['Sustainability', 'Environment'],
            featuredEvent: 'Local River Clean-up'
          }
        ]);
      } else {
        setErgs(ergsData);
      }
    } catch (error) {
      console.error("Error fetching ERGs:", error);
      toast.error("Failed to load ERGs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateErg = async () => {
    if (!user) return toast.error("Must be logged in");
    if (!newErgName || !newErgDescription) return toast.error("Please fill in all required fields");
    
    try {
      const tags = newErgTags.split(',').map(t => t.trim()).filter(t => t);
      const newErg = {
        name: newErgName,
        description: newErgDescription,
        members: [user.uid],
        budgetAllocated: 10000, // Default seed budget
        budgetSpent: 0,
        tags: tags.length ? tags : ['New ERG'],
        featuredEvent: 'Kickoff Meeting'
      };
      
      await addDoc(collection(db, 'ergs'), newErg);
      toast.success('ERG Created Successfully!');
      setIsDialogOpen(false);
      
      // Reset form
      setNewErgName('');
      setNewErgDescription('');
      setNewErgTags('');
      
      fetchERGs();
    } catch (e) {
      console.error(e);
      toast.error('Failed to create ERG');
    }
  };

  const handleJoinLeave = async (ergId: string, currentlyJoined: boolean) => {
    if (!user) return toast.error("Must be logged in");
    if (ergId.startsWith('mock-')) return toast.success(currentlyJoined ? "Left ERG (mock)" : "Joined ERG (mock)");
    
    try {
      const ergRef = doc(db, 'ergs', ergId);
      if (currentlyJoined) {
        await updateDoc(ergRef, { members: arrayRemove(user.uid) });
        toast.success('Left ERG');
      } else {
        await updateDoc(ergRef, { members: arrayUnion(user.uid) });
        toast.success('Joined ERG');
      }
      fetchERGs();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update membership');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Resource Groups (ERGs)</h1>
          <p className="text-gray-500 mt-1">Connect with like-minded colleagues, drive cultural change, and allocate community budgets.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">Start a New ERG</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-6 space-y-4">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold">Start a New ERG</DialogTitle>
              <DialogDescription className="text-gray-500 text-base">
                Create a space for employees with shared characteristics or life experiences. 
                Approved ERGs receive a seed budget to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">ERG Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Working Parents Network" 
                  value={newErgName}
                  onChange={(e) => setNewErgName(e.target.value)}
                  className="p-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">Description & Goals <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the mission and what you aim to achieve..." 
                  className="min-h-[120px] p-3"
                  value={newErgDescription}
                  onChange={(e) => setNewErgDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags" className="text-sm font-medium">Tags (comma separated)</Label>
                <Input 
                  id="tags" 
                  placeholder="e.g., Parents, Support, Community" 
                  value={newErgTags}
                  onChange={(e) => setNewErgTags(e.target.value)}
                  className="p-3"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="px-6">Cancel</Button>
              <Button onClick={handleCreateErg} className="px-6 bg-blue-600 hover:bg-blue-700">Submit Proposal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-gray-500">Loading ERGs...</p>
        ) : ergs.map((erg) => {
          const joined = user ? erg.members?.includes(user.uid) : false;
          return (
          <Card key={erg.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-wrap gap-2">
                  {erg.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{tag}</Badge>
                  ))}
                </div>
              </div>
              <CardTitle>{erg.name}</CardTitle>
              <CardDescription className="line-clamp-2">{erg.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {erg.members?.length || 0} Members
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Community Budget</span>
                  <span className="font-medium">₹{(erg.budgetSpent || 0).toLocaleString()} / ₹{(erg.budgetAllocated || 0).toLocaleString()}</span>
                </div>
                <Progress value={((erg.budgetSpent || 0) / (erg.budgetAllocated || 1)) * 100} className="h-2" />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-4">
                <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Upcoming Event
                </div>
                <p className="text-sm text-gray-600">{erg.featuredEvent || 'No upcoming events'}</p>
              </div>
            </CardContent>
            <CardFooter>
              {joined ? (
                <div className="w-full flex space-x-2">
                  <Button onClick={() => handleJoinLeave(erg.id, true)} variant="outline" className="flex-1 text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
                    <HandHeart className="h-4 w-4 mr-2" /> Member
                  </Button>
                  <Button onClick={() => toast.success('Redirecting to ERG Hub...')} variant="default" className="flex-1 bg-blue-600 hover:bg-blue-700">Go to Hub</Button>
                </div>
              ) : (
                <Button onClick={() => handleJoinLeave(erg.id, false)} className="w-full">Join ERG</Button>
              )}
            </CardFooter>
          </Card>
        )})}
      </div>
    </div>
  );
}"""

content = re.sub(r'import \{ Card.*?from \'@/src/contexts/AuthContext\';', imports, content, flags=re.DOTALL)
content = re.sub(r'export function EmployeeERGs\(\) \{.*', new_component, content, flags=re.DOTALL)

with open('src/pages/EmployeeERGs.tsx', 'w') as f:
    f.write(content)
