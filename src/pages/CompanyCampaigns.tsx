import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

const DEFAULT_CAMPAIGNS = [
  {
    id: 'camp-1',
    name: 'Flood Disaster Relief & Rehabilitation 2026',
    description: '2:1 Corporate Donation Matching for Emergency Shelter, Food Packets, & Clean Water Kits.',
    matchRatio: '2:1',
    budgetCap: 500000,
    utilized: 180000,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'camp-2',
    name: 'Monsoon Green Canopy Forest Drive',
    description: '1.5:1 Matching for urban micro-forest Miyawaki tree planting drives.',
    matchRatio: '1.5:1',
    budgetCap: 300000,
    utilized: 120000,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
  }
];

export function CompanyCampaigns() {
  const { user } = useAuth();
  
  const [campaigns, setCampaigns] = useState<any[]>(DEFAULT_CAMPAIGNS);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      import('@/src/lib/userRole').then(({ getUserRoleInfo }) => {
        getUserRoleInfo(user).then(info => {
          if (info.company) {
            setCompanyId(info.company.id);
            fetchCampaigns(info.company.id);
          } else {
            setLoading(false);
          }
        });
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCampaigns = async (cid: string) => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'companies', cid, 'campaigns'));
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (fetched.length > 0) {
        setCampaigns(fetched);
      } else {
        setCampaigns(DEFAULT_CAMPAIGNS);
      }
    } catch(e) {
      console.error(e);
      setCampaigns(DEFAULT_CAMPAIGNS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!companyId) return;
    try {
      const newCampaign = {
        name: 'Disaster Relief Fund ' + new Date().getFullYear(),
        description: 'Special 2:1 matching for disaster relief efforts.',
        matchRatio: '2:1',
        budgetCap: 500000,
        utilized: 0,
        status: 'active',
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'companies', companyId, 'campaigns'), newCampaign);
      toast.success('New campaign created');
      fetchCampaigns(companyId);
    } catch(e) {
      console.error(e);
      toast.error('Failed to create campaign');
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Matching & Campaigns</h1>
          <p className="text-gray-500 mt-1">Manage donation matching rules and special giving campaigns.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-indigo-100">
          <CardHeader className="bg-indigo-50/50 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 mb-2">Default Rule</Badge>
                <CardTitle className="text-lg">Standard Annual Matching</CardTitle>
                <CardDescription>Applies to all verified charities on the platform.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast('Edit Rule dialog would open here')}>Edit Rule</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Match Ratio</p>
                <p className="text-lg font-bold">1:1</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Annual Cap / Emp</p>
                <p className="text-lg font-bold">₹50,000</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Utilized</p>
                <p className="text-lg font-bold">₹1,240,000</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 mt-1">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-lg font-bold mt-4">Active Campaigns</h3>
        
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">No active campaigns.</p>
              <Button variant="link" onClick={handleCreateCampaign}>Create one now</Button>
            </CardContent>
          </Card>
        ) : campaigns.map(camp => (
          <Card key={camp.id} className="overflow-hidden">
            {camp.imageUrl && (
              <div className="h-40 w-full overflow-hidden bg-gray-100">
                <img src={camp.imageUrl} alt={camp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 bg-amber-50 text-amber-700 border-amber-200">Special Campaign</Badge>
                  <CardTitle className="text-lg">{camp.name}</CardTitle>
                  <CardDescription>{camp.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Pause</Button>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Match Ratio</p>
                  <p className="text-lg font-bold">{camp.matchRatio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Campaign Cap</p>
                  <p className="text-lg font-bold">₹{camp.budgetCap?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Utilized</p>
                  <p className="text-lg font-bold">₹{camp.utilized?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="text-lg font-bold">Dec 31</p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(camp.utilized / camp.budgetCap) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}