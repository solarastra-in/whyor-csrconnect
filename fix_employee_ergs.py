import re
with open('src/pages/EmployeeERGs.tsx', 'r') as f:
    content = f.read()

# Add imports
imports = """import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Megaphone, Calendar, ArrowRight, HandHeart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';"""

# Replace mock data with state and fetch logic
new_component = """export function EmployeeERGs() {
  const [ergs, setErgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchERGs();
  }, []);

  const fetchERGs = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'ergs'));
      const ergsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If empty, supply some defaults or just leave empty
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
        <Button onClick={() => toast.success('Starting new ERG workflow...')} className="bg-blue-600 hover:bg-blue-700">Start a New ERG</Button>
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
                <div className="flex gap-2">
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

content = re.sub(r'import \{ Card.*?from \'sonner\';', imports, content, flags=re.DOTALL)
content = re.sub(r'const ergs = \[.*\];.*?export function EmployeeERGs\(\) \{.*\}', new_component, content, flags=re.DOTALL)

with open('src/pages/EmployeeERGs.tsx', 'w') as f:
    f.write(content)
