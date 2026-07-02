import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Filter, MapPin, ExternalLink, ArrowRight, CheckCircle, XCircle, Edit2, Archive, Tag, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { GlobalCSRMap } from '@/src/components/GlobalCSRMap';

const mockCharities = [
  { 
    id: 1, 
    name: 'Vidya Trust', 
    focus: 'Education', 
    location: 'Pune, Maharashtra', 
    website: 'https://vidyatrust.example.org',
    promotors: 'Dr. Anil Kumar, Mrs. Sunita Sharma',
    brief: 'Empowering rural youth through digital literacy.',
    summary: 'Vidya Trust has been working since 2010 to provide quality education and digital skills to underprivileged children in rural Maharashtra. They operate 50+ computer centers and have reached over 10,000 students.',
    projects: 12, 
    rating: 4.8,
    status: 'approved',
    activeProjects: [
      { id: 101, name: 'Digital Skills for Youth', status: 'Funding Active' },
      { id: 102, name: 'Rural Library Setup', status: 'Volunteers Needed' }
    ]
  },
  { 
    id: 2, 
    name: 'Jal Foundation', 
    focus: 'Environment', 
    location: 'Varanasi, UP', 
    website: 'https://jalfoundation.example.org',
    promotors: 'Rajesh Singh',
    brief: 'Restoring the ecological balance of major rivers.',
    summary: 'Jal Foundation focuses on water conservation and river cleaning initiatives across North India. Their primary ongoing project is the cleanup of the Ganga river banks and promoting sustainable waste management among locals.',
    projects: 5, 
    rating: 4.9,
    status: 'approved',
    activeProjects: [
      { id: 201, name: 'Clean Ganga Initiative', status: 'Funding Active' }
    ]
  },
  { 
    id: 3, 
    name: 'Green Future', 
    focus: 'Sustainability', 
    location: 'Bangalore, Karnataka', 
    website: 'https://greenfuture.example.org',
    promotors: 'Anita Desai, Rohan Mehta',
    brief: 'Urban afforestation and renewable energy solutions.',
    summary: 'Green Future is dedicated to fighting climate change through tree planting campaigns in urban spaces and providing solar energy solutions to remote villages in Karnataka.',
    projects: 8, 
    rating: 4.5,
    status: 'pending',
    activeProjects: [
      { id: 301, name: 'Urban Afforestation', status: 'Funding & Volunteers' },
      { id: 302, name: 'Solar for Villages', status: 'Funding Active' }
    ]
  },
  { 
    id: 4, 
    name: 'Asha Healthcare', 
    focus: 'Health', 
    location: 'Rural Rajasthan', 
    website: 'https://ashahealth.example.org',
    promotors: 'Dr. Vikram Patel',
    brief: 'Providing accessible healthcare to remote villages.',
    summary: 'Asha Healthcare operates mobile medical clinics equipped with basic diagnostic tools and medicines, reaching out to isolated communities in rural Rajasthan that lack access to primary healthcare.',
    projects: 3, 
    rating: 4.7,
    status: 'archived',
    activeProjects: [
      { id: 401, name: 'Mobile Clinics', status: 'Funding Active' }
    ]
  },
];

export function Charities() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [charitiesList, setCharitiesList] = useState(mockCharities);
  const [selectedCharityIds, setSelectedCharityIds] = useState<any[]>([]);

  // Edit Charity State
  const [editCharityOpen, setEditCharityOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<any>(null);

  // View Charity Details State
  const [viewCharityOpen, setViewCharityOpen] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'charities'));
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCharitiesList(prev => {
        // filter out mocks if they match, or just append. 
        // to be safe, let's just use fetched if it has items, otherwise mock.
        // Actually, let's combine them but avoid duplicates if we ran multiple times
        const mockMap = new Map(mockCharities.map(c => [c.id, c]));
        fetched.forEach(f => mockMap.set(f.id, f as any));
        return Array.from(mockMap.values());
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'projects'));
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        updatedAt: Date.now()
      });
      toast.success(`Project ${newStatus} successfully`);
      fetchProjects();
    } catch (error) {
      console.error("Error updating project status:", error);
      toast.error("Failed to update project status");
    }
  };

  const openEditCharity = (charity: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCharity({ ...charity });
    setEditCharityOpen(true);
  };

  const handleEditCharitySubmit = async () => {
    if (typeof editingCharity.id === 'string') {
      try {
        const { id, activeProjects, ...updateData } = editingCharity;
        await updateDoc(doc(db, 'charities', id), updateData);
      } catch (e) {
        console.error(e);
        toast.error('Failed to update charity in database');
      }
    }
    setCharitiesList(prev => prev.map(c => c.id === editingCharity.id ? editingCharity : c));
    toast.success('Charity details updated');
    setEditCharityOpen(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCharityIds(charitiesList.map(c => c.id));
    } else {
      setSelectedCharityIds([]);
    }
  };

  const handleSelectCharity = (id: any, checked: boolean) => {
    if (checked) {
      setSelectedCharityIds(prev => [...prev, id]);
    } else {
      setSelectedCharityIds(prev => prev.filter(cId => cId !== id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCharityIds.length === 0) return;
    
    const newStatus = action === 'approve' ? 'approved' : action === 'archive' ? 'archived' : '';
    
    if (newStatus) {
      const auth = getAuth();
      for (const id of selectedCharityIds) {
        if (typeof id === 'string') { // It's from Firestore
          try {
            await updateDoc(doc(db, 'charities', id), { status: newStatus });
            if (auth.currentUser) {
              await addDoc(collection(db, 'platform/auditLog/events'), {
                action: action === 'approve' ? 'APPROVE_CHARITY' : 'REJECT_CHARITY',
                charityId: id,
                performedBy: auth.currentUser.email,
                timestamp: new Date().getTime()
              });
            }
          } catch(e) {
            console.error(e);
          }
        }
      }
    }
    
    setCharitiesList(prev => prev.map(c => {
      if (selectedCharityIds.includes(c.id)) {
        if (action === 'approve') return { ...c, status: 'approved' };
        if (action === 'archive') return { ...c, status: 'archived' };
      }
      return c;
    }));
    
    toast.success(`Successfully applied action: ${action} to ${selectedCharityIds.length} items`);
    setSelectedCharityIds([]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Charities & NGOs</h1>
          <p className="text-gray-500">Manage registered CSR entities and their projects.</p>
        </div>
        <Link 
          to="/admin/charities/onboard"
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 flex items-center self-start sm:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Onboard Charity
        </Link>
      </div>

      <div className="mb-8">
        <GlobalCSRMap />
      </div>

      <Tabs defaultValue="charities" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="charities">Registered Charities</TabsTrigger>
          <TabsTrigger value="projects">Project Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charities" className="space-y-6 mt-0">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search charities by name or focus..." className="pl-9" />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </button>
            </div>
            
            {selectedCharityIds.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="text-sm font-medium text-indigo-800">
                  {selectedCharityIds.length} charity(s) selected
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200" onClick={() => handleBulkAction('approve')}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200" onClick={() => handleBulkAction('categorize')}>
                    <Tag className="w-4 h-4 mr-2" /> Categorize
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white hover:bg-red-50 text-red-700 border-red-200" onClick={() => handleBulkAction('archive')}>
                    <Archive className="w-4 h-4 mr-2" /> Archive
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium w-12">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300"
                          checked={selectedCharityIds.length === charitiesList.length && charitiesList.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="px-6 py-4 font-medium">NGO Name</th>
                      <th className="px-6 py-4 font-medium">Focus Area</th>
                      <th className="px-6 py-4 font-medium">Location</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {charitiesList.map((charity) => (
                      <tr 
                        key={charity.id} 
                        className={`border-b hover:bg-gray-50 cursor-pointer ${selectedCharityIds.includes(charity.id) ? 'bg-indigo-50/30' : ''}`}
                        onClick={() => { setSelectedCharity(charity); setViewCharityOpen(true); }}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300"
                            checked={selectedCharityIds.includes(charity.id)}
                            onChange={(e) => handleSelectCharity(charity.id, e.target.checked)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center font-bold text-xs">
                              {charity.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{charity.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{charity.focus}</td>
                        <td className="px-6 py-4 text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" /> {charity.location}
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant="secondary" 
                            className={
                              charity.status === 'approved' ? 'bg-green-50 text-green-700 hover:bg-green-50' : 
                              charity.status === 'archived' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100' :
                              'bg-yellow-50 text-yellow-700 hover:bg-yellow-50'
                            }
                          >
                            {charity.status ? charity.status.charAt(0).toUpperCase() + charity.status.slice(1) : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); openEditCharity(charity, e); }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {charitiesList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No charities found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={viewCharityOpen} onOpenChange={setViewCharityOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              {selectedCharity && (
                <>
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-xl">{selectedCharity.name}</DialogTitle>
                      {selectedCharity.website && (
                        <a href={selectedCharity.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
                          <ExternalLink className="h-4 w-4 mr-1" /> Website
                        </a>
                      )}
                    </div>
                    <DialogDescription>
                      {selectedCharity.location} • {selectedCharity.focus}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    {selectedCharity.summary && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-900">Summary</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedCharity.summary}</p>
                      </div>
                    )}
                    {selectedCharity.promotors && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-900">Promoters</h4>
                        <p className="text-sm text-gray-700">{selectedCharity.promotors}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-gray-900">Projects Directory</h4>
                      <div className="space-y-3">
                        {selectedCharity.activeProjects.map((project: any) => (
                          <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:border-gray-200 transition-colors">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{project.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{project.status}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast('Project details would open here')}>
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {selectedCharity.activeProjects.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No active projects right now.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={editCharityOpen} onOpenChange={setEditCharityOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Charity Details</DialogTitle>
                <DialogDescription>
                  Update the details for this registered charity/NGO.
                </DialogDescription>
              </DialogHeader>
              {editingCharity && (
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                  <div className="grid gap-2">
                    <Label htmlFor="charity-name">Charity Name</Label>
                    <Input
                      id="charity-name"
                      value={editingCharity.name}
                      onChange={(e) => setEditingCharity({ ...editingCharity, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="charity-website">Website</Label>
                    <Input
                      id="charity-website"
                      value={editingCharity.website || ''}
                      onChange={(e) => setEditingCharity({ ...editingCharity, website: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="charity-focus">Primary Focus Area</Label>
                    <Input
                      id="charity-focus"
                      value={editingCharity.focus}
                      onChange={(e) => setEditingCharity({ ...editingCharity, focus: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="charity-location">Location</Label>
                    <Input
                      id="charity-location"
                      value={editingCharity.location}
                      onChange={(e) => setEditingCharity({ ...editingCharity, location: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="charity-promoters">Promoters</Label>
                    <Input
                      id="charity-promoters"
                      value={editingCharity.promotors || ''}
                      onChange={(e) => setEditingCharity({ ...editingCharity, promotors: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="charity-brief">Brief</Label>
                    <Input
                      id="charity-brief"
                      value={editingCharity.brief || ''}
                      onChange={(e) => setEditingCharity({ ...editingCharity, brief: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="charity-summary">Summary</Label>
                    <textarea
                      id="charity-summary"
                      className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                      value={editingCharity.summary || ''}
                      onChange={(e) => setEditingCharity({ ...editingCharity, summary: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditCharityOpen(false)}>Cancel</Button>
                <Button onClick={handleEditCharitySubmit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Project Name</th>
                      <th className="px-6 py-4 font-medium">Charity</th>
                      <th className="px-6 py-4 font-medium">Submitted</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading projects...</td>
                      </tr>
                    ) : projects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No project submissions found.</td>
                      </tr>
                    ) : (
                      projects.map((project) => (
                        <tr key={project.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                          <td className="px-6 py-4 text-gray-500">{project.charityName || 'Unknown Charity'}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant="outline" 
                              className={
                                project.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                                project.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }
                            >
                              {project.status || 'pending'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {(!project.status || project.status === 'pending') && (
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleUpdateStatus(project.id, 'approved')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleUpdateStatus(project.id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
