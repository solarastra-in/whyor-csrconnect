import { useAuth } from '@/src/contexts/AuthContext';

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useVolunteer } from '@/src/contexts/VolunteerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Heart, Filter, Check, Clock, Star, Calendar as CalendarIcon, Grid, CalendarDays, FileText, Download, FileDown, Upload, Eye, EyeOff, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { DonationGamification } from '@/src/components/DonationGames';
import { ProjectChat } from '@/src/components/ProjectChat';
import { DocumentRepository } from '@/src/components/DocumentRepository';
import { ProjectQRCode } from '@/src/components/ProjectQRCode';
import { toast } from 'sonner';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';


export interface Project {
  id: string;
  name: string;
  charity: string;
  location: string;
  match: string;
  tags: string[];
  description: string;
  image?: string;
  vision?: string;
  aboutCharity?: string;
  website?: string;
  contact?: {
    email: string;
    phone: string;
    person: string;
  };
  guidelines?: { title: string; size: string; type: string }[];
  volunteerRoles?: { id: string; title: string; description: string; hoursNeeded: number; hoursPledged: number; type: string; skills: string[] }[];
}




const tomorrow = new Date();
tomorrow.setHours(tomorrow.getHours() + 23); // 23 hours from now

export const upcomingSessions = [
  { id: 1, date: tomorrow.toISOString(), title: 'Riverbank Cleanup Crew Orientation', project: 'Clean Ganga Initiative', type: 'Session' },
  { id: 2, date: '2026-07-10T17:00:00Z', title: 'Registration Deadline', project: 'Clean Ganga Initiative', type: 'Deadline' },
  { id: 3, date: '2026-07-12T10:00:00Z', title: 'Coding Bootcamp Kickoff', project: 'Digital Skills for Youth', type: 'Session' },
  { id: 4, date: '2026-07-15T12:00:00Z', title: 'Sapling Planting Deadline', project: 'Urban Afforestation', type: 'Deadline' },
  { id: 5, date: '2026-07-20T08:00:00Z', title: 'Solar Panel Installation Workshop', project: 'Solar for Villages', type: 'Session' },
];

export function DiscoverProjects() {
  const { addHours, userSkills } = useVolunteer();
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(collection(db, 'projects'));
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjectsData(fetched);
        
        const tags = Array.from(new Set(fetched.flatMap(p => p.tags || [])));
        setAllTags(tags);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProjects();
  }, []);
  const location = useLocation();
  const { roleInfo } = useAuth();
  const navigate = useNavigate();
  const isCompanyAdmin = roleInfo?.role === 'company_admin' || roleInfo?.role === 'platform_admin';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [donateAmount, setDonateAmount] = useState('');
  const [volunteerHours, setVolunteerHours] = useState('');
  const [searchHistory, setSearchHistory] = useState<Array<{term: string, tags: string[]}>>([]);
  const [savedProjects, setSavedProjects] = useState<number[]>([]);
  const [pledgedProjects, setPledgedProjects] = useState<number[]>([]);
  const [hiddenProjects, setHiddenProjects] = useState<number[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [donateStep, setDonateStep] = useState<'amount' | 'payment' | 'game' | 'complete'>('amount');
  const [donateMultiplier, setDonateMultiplier] = useState<number | null>(null);

  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  const startEditing = (project: any) => {
    setEditingProjectId(project.id);
    setEditFormData({ ...project });
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setEditFormData(null);
  };

  const saveEditing = () => {
    if (editFormData) {
      setProjectsData(prev => prev.map(p => p.id === editFormData.id ? editFormData : p));
      toast.success("Project updated successfully");
      setEditingProjectId(null);
      setEditFormData(null);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('projectSearchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {}
    }

    const savedProjs = localStorage.getItem('savedProjects');
    if (savedProjs) {
      try {
        setSavedProjects(JSON.parse(savedProjs));
      } catch(e) {}
    }

    const pledgedProjs = localStorage.getItem('pledgedProjects');
    if (pledgedProjs) {
      try {
        setPledgedProjects(JSON.parse(pledgedProjs));
      } catch(e) {}
    }
    
    const hiddenProjs = localStorage.getItem('hiddenProjects');
    if (hiddenProjs) {
      try {
        setHiddenProjects(JSON.parse(hiddenProjs));
      } catch(e) {}
    }


  }, []);

  const toggleSaveProject = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedProjects(prev => {
      const isSaved = prev.includes(id);
      const newSaved = isSaved ? prev.filter(pId => pId !== id) : [...prev, id];
      localStorage.setItem('savedProjects', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const toggleHideProject = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setHiddenProjects(prev => {
      const isHidden = prev.includes(id);
      const newHidden = isHidden ? prev.filter(pId => pId !== id) : [...prev, id];
      localStorage.setItem('hiddenProjects', JSON.stringify(newHidden));
      toast.success(isHidden ? 'Project is now visible to employees' : 'Project is now hidden from employees');
      return newHidden;
    });
  };

  useEffect(() => {
    if (searchTerm === '' && selectedTags.length === 0) return;

    const timeoutId = setTimeout(() => {
      setSearchHistory(prev => {
        const isDuplicate = prev.length > 0 && prev[0].term === searchTerm && JSON.stringify(prev[0].tags) === JSON.stringify(selectedTags);
        if (isDuplicate) return prev;

        const newHistory = [{term: searchTerm, tags: selectedTags}, ...prev].filter((v, i, a) => a.findIndex(t => t.term === v.term && JSON.stringify(t.tags) === JSON.stringify(v.tags)) === i).slice(0, 5);
        localStorage.setItem('projectSearchHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredProjects = projectsData.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.charity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.volunteerRoles.some(role => role.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.some(tag => project.tags.includes(tag));
                        
    const matchesVisibility = isCompanyAdmin || !hiddenProjects.includes(project.id);
                        
    return matchesSearch && matchesTags && matchesVisibility;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Discover Projects</h1>
          <p className="text-gray-500 mt-1">Find causes you care about and maximize your impact with company matching.</p>
        </div>
        {!isCompanyAdmin && (
          <Button onClick={() => toast.success("Project nomination request sent to company admin for approval.")} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            Nominate Project
          </Button>
        )}
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex gap-4 mb-6 flex-wrap justify-between items-center">
          <div className="flex gap-4 flex-wrap flex-1 min-w-[300px]">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by title, location, or skill..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger render={<Button variant="outline" className="flex items-center" />}>
                <Filter className="mr-2 h-4 w-4" />
                Filters {selectedTags.length > 0 && `(${selectedTags.length})`}
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {allTags.map((tag) => (
                        <CommandItem
                          key={tag}
                          onSelect={() => toggleTag(tag)}
                        >
                          <div className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            selectedTags.includes(tag)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}>
                            <Check className={cn("h-4 w-4")} />
                          </div>
                          <span>{tag}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedTags.length > 0 && (
              <Button variant="ghost" onClick={() => setSelectedTags([])} className="text-muted-foreground hover:text-foreground">
                Clear filters
              </Button>
            )}
          </div>
          
          <TabsList>
            <TabsTrigger value="grid"><Grid className="h-4 w-4 mr-2" /> Grid</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarIcon className="h-4 w-4 mr-2" /> Calendar</TabsTrigger>
          </TabsList>
        </div>

        {searchHistory.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-gray-500 flex items-center font-medium"><Clock className="h-4 w-4 mr-1" /> Recent:</span>
            {searchHistory.map((history, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100 flex items-center gap-1 bg-white"
                onClick={() => {
                  setSearchTerm(history.term);
                  setSelectedTags(history.tags);
                }}
              >
                {history.term || 'Any'} {history.tags.length > 0 ? `+ ${history.tags.length} tag${history.tags.length > 1 ? 's' : ''}` : ''}
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600" onClick={() => {
              setSearchHistory([]);
              localStorage.removeItem('projectSearchHistory');
            }}>Clear History</Button>
          </div>
        )}

        <TabsContent value="grid" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const projectSkills = project.volunteerRoles.flatMap(r => r.skills || []);
          const matchesSkills = userSkills.length > 0 && projectSkills.some(skill => userSkills.includes(skill));

          return (
          <Card key={project.id} className={`hover:shadow-md transition-shadow flex flex-col overflow-hidden ${matchesSkills ? 'ring-2 ring-purple-500' : ''}`}>
            <CardContent className="p-0 flex flex-col flex-1">
              <div className="h-48 bg-gray-200 relative">
                <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-blue-700 shadow-sm flex items-center">
                    <Heart className="h-3 w-3 mr-1 fill-blue-700" /> {project.match}
                  </div>
                  {matchesSkills && (
                    <div className="bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white shadow-sm flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-white" /> Best Match
                    </div>
                  )}
                </div>
                <button 
                  onClick={(e) => toggleSaveProject(e, project.id)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                  title={savedProjects.includes(project.id) ? "Remove from saved" : "Save project"}
                >
                  <Heart className={`h-4 w-4 ${savedProjects.includes(project.id) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                </button>
                {isCompanyAdmin && (
                  <button 
                    onClick={(e) => toggleHideProject(e, project.id)}
                    className="absolute top-3 right-14 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                    title={hiddenProjects.includes(project.id) ? "Show to employees" : "Hide from employees"}
                  >
                    {hiddenProjects.includes(project.id) ? <EyeOff className="h-4 w-4 text-red-500" /> : <Eye className="h-4 w-4 text-green-600" />}
                  </button>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {project.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">{tag}</Badge>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500 flex items-center mb-3">
                  <MapPin className="h-3.5 w-3.5 mr-1" /> {project.location} • {project.charity}
                </p>
                <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-3">{project.description}</p>
                
                <div className="flex flex-col gap-3 mt-auto">
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" className="w-full text-gray-700" />}>
                      View Full Details
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{project.name}</DialogTitle>
                        <DialogDescription className="text-base">
                          {project.location} • By {project.charity}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="py-4">
                        <Tabs defaultValue="details" className="w-full">
                          <TabsList className="mb-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="resources">Resources</TabsTrigger>
                            <TabsTrigger value="chat">Team Chat</TabsTrigger>
                            {isCompanyAdmin && <TabsTrigger value="attendance">Attendance</TabsTrigger>}
                            {isCompanyAdmin && <TabsTrigger value="audit">Activity Audit</TabsTrigger>}
                          </TabsList>
                          
                          <TabsContent value="details" className="space-y-6">
                            {editingProjectId === project.id ? (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-xl font-bold text-gray-900">Edit Project Details</h3>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={cancelEditing}>Cancel</Button>
                                    <Button size="sm" onClick={saveEditing}>Save Changes</Button>
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label>Image URL</Label>
                                  <Input value={editFormData?.image || ''} onChange={(e) => setEditFormData({...editFormData, image: e.target.value})} />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Description</Label>
                                  <textarea className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" value={editFormData?.description || ''} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Vision</Label>
                                  <textarea className="w-full min-h-[80px] p-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" value={editFormData?.vision || ''} onChange={(e) => setEditFormData({...editFormData, vision: e.target.value})} />
                                </div>
                                <div className="grid gap-2">
                                  <Label>About Charity</Label>
                                  <textarea className="w-full min-h-[80px] p-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" value={editFormData?.aboutCharity || ''} onChange={(e) => setEditFormData({...editFormData, aboutCharity: e.target.value})} />
                                </div>
                                <div className="grid gap-4 bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
                                  <h4 className="font-semibold text-gray-900">Contact Information</h4>
                                  <div className="grid gap-2">
                                    <Label>Contact Person</Label>
                                    <Input value={editFormData?.contact?.person || ''} onChange={(e) => setEditFormData({...editFormData, contact: {...editFormData.contact, person: e.target.value}})} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input value={editFormData?.contact?.email || ''} onChange={(e) => setEditFormData({...editFormData, contact: {...editFormData.contact, email: e.target.value}})} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Phone</Label>
                                    <Input value={editFormData?.contact?.phone || ''} onChange={(e) => setEditFormData({...editFormData, contact: {...editFormData.contact, phone: e.target.value}})} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Website</Label>
                                    <Input value={editFormData?.website || ''} onChange={(e) => setEditFormData({...editFormData, website: e.target.value})} />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                {isCompanyAdmin && (
                                  <div className="flex justify-end mb-2">
                                    <Button variant="outline" size="sm" onClick={() => startEditing(project)} className="text-gray-700 bg-white shadow-sm border-gray-200">
                                      Edit Project
                                    </Button>
                                  </div>
                                )}
                                <img src={project.image} alt={project.name} className="w-full h-64 object-cover rounded-lg" />
                                
                                <div>
                                  <h4 className="font-semibold text-lg mb-2">About the Project</h4>
                                  <p className="text-gray-700">{project.description}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-lg mb-2">Vision</h4>
                                  <p className="text-gray-700">{project.vision}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-lg mb-2">About {project.charity}</h4>
                                  <p className="text-gray-700">{project.aboutCharity}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-2">Contact Information</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p><strong>Contact Person:</strong> {project.contact.person}</p>
                                    <p><strong>Email:</strong> {project.contact.email}</p>
                                    <p><strong>Phone:</strong> {project.contact.phone}</p>
                                    <p><strong>Website:</strong> <a href={project.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{project.website}</a></p>
                                  </div>
                                </div>
                              </>
                            )}
                          </TabsContent>

                          <TabsContent value="resources" className="space-y-6 mt-4">
                            <DocumentRepository isAdmin={isCompanyAdmin} projectId={project.id.toString()} />
                          </TabsContent>

                          <TabsContent value="chat">
                            <div className="mt-2">
                              {pledgedProjects.includes(project.id) ? (
                                <ProjectChat projectId={project.id} projectName={project.name} />
                              ) : (
                                <div className="bg-gray-50 p-6 rounded-lg text-center">
                                  <p className="text-gray-500 mb-2">Pledge hours to this project to unlock the team chat!</p>
                                  <p className="text-sm text-gray-400">Coordinate directly with other volunteers once you sign up.</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          {isCompanyAdmin && (
                            <TabsContent value="attendance" className="py-6 flex justify-center">
                              <ProjectQRCode projectId={project.id.toString()} projectName={project.name} />
                            </TabsContent>
                          )}

                          {isCompanyAdmin && (
                            <TabsContent value="audit">
                              <div className="space-y-4 mt-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-semibold text-lg text-slate-800">Volunteer Check-ins</h4>
                                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Compliance Validated</Badge>
                                </div>
                                <div className="rounded-md border overflow-hidden">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-slate-50">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Volunteer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      <tr>
                                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">Sarah Jenkins</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">Riverbank Cleanup Crew</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">Oct 12, 2023</td>
                                        <td className="px-4 py-3"><Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none font-normal">Verified</Badge></td>
                                      </tr>
                                      <tr>
                                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">Michael Chang</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">Community Coordinator</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">Oct 14, 2023</td>
                                        <td className="px-4 py-3"><Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none font-normal">Pending</Badge></td>
                                      </tr>
                                      <tr>
                                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">David Miller</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">Riverbank Cleanup Crew</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">Oct 14, 2023</td>
                                        <td className="px-4 py-3"><Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none font-normal">Verified</Badge></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 flex items-start gap-2">
                                  <Clock className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                                  <p>Activity logs and compliance status updates are securely retained for 7 years to meet corporate and regulatory standards.</p>
                                </div>
                              </div>
                            </TabsContent>
                          )}
                        </Tabs>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex gap-3">
                    {!isCompanyAdmin && (
                      <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors" onClick={() => toast.info('Donation processing via Razorpay is coming soon.')}>
                          Donate (Coming Soon)
                        </Button>
                    )}

                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors" />}>
                        {isCompanyAdmin ? 'Manage Volunteering' : 'Volunteer'}
                      </DialogTrigger>
                      <DialogContent className={isCompanyAdmin ? "sm:max-w-2xl p-6 sm:p-8" : "sm:max-w-xl p-6 sm:p-8"}>
                        <DialogHeader>
                          <DialogTitle>{isCompanyAdmin ? 'Manage Volunteer Roles for ' + project.name : 'Volunteer for ' + project.name}</DialogTitle>
                          <DialogDescription>
                            {isCompanyAdmin 
                              ? 'Add specific volunteering roles and effort requirements so employees can find the right fit.'
                              : 'Select a volunteering role and pledge your hours.'}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {isCompanyAdmin ? (
                          <div className="space-y-6 py-4">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-sm text-gray-700">Existing Roles</h4>
                              {project.volunteerRoles.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No roles defined yet.</p>
                              ) : (
                                <div className="grid gap-3">
                                  {project.volunteerRoles.map(role => (
                                    <div key={role.id} className="border rounded-md p-3">
                                      <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-medium text-gray-900">{role.title} <Badge variant="secondary" className="ml-2">{role.type}</Badge></h5>
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                          {role.hoursPledged} / {role.hoursNeeded} hrs filled
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                                      {role.skills && role.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {role.skills.map((skill, idx) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] bg-slate-50 text-slate-600">{skill}</Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-4 py-4">
                            <div className="space-y-4">
                              <Label>Select a Role</Label>
                              {project.volunteerRoles.length === 0 ? (
                                <p className="text-sm text-gray-500">No specific roles defined yet. You can still pledge general hours.</p>
                              ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                  {project.volunteerRoles.map(role => (
                                    <label key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                                      <input type="radio" name="role" className="mt-1" />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-900 text-sm">{role.title}</span>
                                          <Badge variant="outline" className="text-[10px] h-4 py-0">{role.type}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                                        {role.skills && role.skills.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2 mb-1">
                                            {role.skills.map((skill, idx) => (
                                              <Badge key={idx} variant="secondary" className="text-[9px] px-1 py-0">{skill}</Badge>
                                            ))}
                                          </div>
                                        )}
                                        <p className="text-xs font-medium text-blue-600 mt-1">{role.hoursNeeded - role.hoursPledged} hours still needed</p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 mt-2">
                              <Label htmlFor="hours" className="text-right">
                                Hours to Pledge
                              </Label>
                              <Input
                                id="hours"
                                type="number"
                                value={volunteerHours}
                                onChange={(e) => setVolunteerHours(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. 4"
                              />
                            </div>
                          </div>
                        )}
                        {!isCompanyAdmin && (
                          <DialogFooter>
                            <Button type="submit" onClick={() => {
                              const hrs = parseFloat(volunteerHours);
                              if (hrs > 0) {
                                addHours(hrs, project.name);
                                setPledgedProjects(prev => {
                                  const next = prev.includes(project.id) ? prev : [...prev, project.id];
                                  localStorage.setItem('pledgedProjects', JSON.stringify(next));
                                  return next;
                                });
                                toast.success(`Registered for ${project.name}`, {
                                  description: `You have successfully pledged ${hrs} hours.`,
                                  action: {
                                    label: 'View My Impact',
                                    onClick: () => navigate('/employee/impact')
                                  },
                                });
                              }
                              setVolunteerHours('');
                            }}>Pledge Hours</Button>
                          </DialogFooter>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="m-0">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Upcoming Sessions & Deadlines</h3>
                <Button variant="outline" size="sm"><CalendarDays className="h-4 w-4 mr-2" /> Sync to Calendar</Button>
              </div>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {session.type === 'Deadline' ? (
                        <Clock className="h-4 w-4 text-orange-500" />
                      ) : (
                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className={session.type === 'Deadline' ? 'text-orange-600 border-orange-200 bg-orange-50' : 'text-blue-600 border-blue-200 bg-blue-50'}>
                          {session.type}
                        </Badge>
                        <time className="text-sm font-medium text-slate-500">
                          {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-2">{session.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{session.project}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
