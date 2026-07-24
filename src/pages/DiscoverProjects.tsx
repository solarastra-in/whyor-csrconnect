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
import { Search, MapPin, Heart, Filter, Check, Clock, Star, Calendar as CalendarIcon, Grid, CalendarDays, FileText, Download, FileDown, Upload, Eye, EyeOff, CreditCard, Share2, Sparkles, Layers, SlidersHorizontal, X, Bell, BellRing, Users, Map } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DonationGamification } from '@/src/components/DonationGames';
import { ProjectChat } from '@/src/components/ProjectChat';
import { DocumentRepository } from '@/src/components/DocumentRepository';
import { ProjectQRCode } from '@/src/components/ProjectQRCode';
import { SharedProjectCalendarView } from '@/src/components/SharedProjectCalendarView';
import { ProjectTestimonials } from '@/src/components/ProjectTestimonials';
import { ProjectShareModal } from '@/src/components/ProjectShareModal';
import { ProjectMapView } from '@/src/components/ProjectMapView';
import { BulkRegistrationModal } from '@/src/components/BulkRegistrationModal';
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
  status?: string;
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

const DEFAULT_DISCOVER_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Clean Ganga Riverfront Drive',
    charity: 'EcoBharat Foundation',
    location: 'Varanasi, Uttar Pradesh',
    match: '98% Match',
    tags: ['Environment', 'Water Sanitation', 'Community'],
    description: 'Participate in riverbank cleanup drives, water quality testing workshops, and waste management campaigns along the Ganges.',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    vision: 'Restoring pristine ecological balance and community stewardship across major river basins in India.',
    aboutCharity: 'EcoBharat Foundation works on sustainable water conservation, afforestation, and zero-waste initiatives across India.',
    website: 'https://ecobharat.org',
    contact: { email: 'contact@ecobharat.org', phone: '+91 98765 43210', person: 'Aarav Sharma' },
    guidelines: [{ title: 'Safety Guide.pdf', size: '1.2 MB', type: 'PDF' }],
    volunteerRoles: [
      { id: 'r1', title: 'Cleanup Volunteer', description: 'Lead group cleanup batches along riverfront.', hoursNeeded: 20, hoursPledged: 14, type: 'On-site', skills: ['Event Management', 'Environmental Science'] },
      { id: 'r2', title: 'Data Analyst', description: 'Log plastic waste metrics and generate progress dashboards.', hoursNeeded: 10, hoursPledged: 8, type: 'Remote', skills: ['Data Analysis', 'Excel'] }
    ]
  },
  {
    id: 'proj-2',
    name: 'Digital Literacy for Rural Youth',
    charity: 'Shiksha India Trust',
    location: 'Remote / Bengaluru, Karnataka',
    match: '95% Match',
    tags: ['Education', 'Technology', 'Skill Development'],
    description: 'Mentor high school students in basic computer skills, Python fundamentals, and digital safety through weekly online webinars.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    vision: 'Empowering 100,000 rural students with digital skills for the future workforce.',
    aboutCharity: 'Shiksha India Trust bridges the educational divide by delivering tech infrastructure and mentorship to underserved schools.',
    website: 'https://shikshaindia.org',
    contact: { email: 'info@shikshaindia.org', phone: '+91 98123 45678', person: 'Priya Sundaram' },
    guidelines: [{ title: 'Mentorship Guide.pdf', size: '2.4 MB', type: 'PDF' }],
    volunteerRoles: [
      { id: 'r3', title: 'Python Tutor', description: 'Conduct 1-hour interactive weekly coding classes.', hoursNeeded: 15, hoursPledged: 10, type: 'Remote', skills: ['Python', 'Teaching'] }
    ]
  },
  {
    id: 'proj-3',
    name: 'Urban Miyawaki Micro-Forest Drive',
    charity: 'Green Canopy Initiative',
    location: 'Gurugram, Haryana',
    match: '92% Match',
    tags: ['Environment', 'Climate Action', 'Urban Greenery'],
    description: 'Plant native Miyawaki micro-forests in urban park spaces to boost urban biodiversity and improve air quality index.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    vision: 'Creating 500 urban micro-forests across tier-1 and tier-2 cities in India.',
    aboutCharity: 'Green Canopy Initiative specializes in high-density native afforestation and urban ecology regeneration.',
    website: 'https://greencanopy.org',
    contact: { email: 'tree@greencanopy.org', phone: '+91 97111 22334', person: 'Rohan Gupta' },
    guidelines: [{ title: 'Planting Manual.pdf', size: '1.8 MB', type: 'PDF' }],
    volunteerRoles: [
      { id: 'r4', title: 'Planting Site Leader', description: 'Organize sapling distribution and planting teams.', hoursNeeded: 25, hoursPledged: 18, type: 'On-site', skills: ['Logistics', 'Leadership'] }
    ]
  },
  {
    id: 'proj-4',
    name: 'Rural Solar Micro-Grid Electrification',
    charity: 'Surya Jyoti Alliance',
    location: 'Ranchi, Jharkhand',
    match: '90% Match',
    tags: ['Clean Energy', 'Renewable', 'Rural Infrastructure'],
    description: 'Help deploy standalone solar panels and battery storage units to bring reliable electricity to off-grid tribal villages.',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    vision: 'Solar lighting and power for 50,000 off-grid rural households.',
    aboutCharity: 'Surya Jyoti Alliance implements sustainable clean energy solutions for remote communities.',
    website: 'https://suryajyoti.org',
    contact: { email: 'solar@suryajyoti.org', phone: '+91 94321 09876', person: 'Anand Verma' },
    guidelines: [{ title: 'Solar Tech Brief.pdf', size: '3.1 MB', type: 'PDF' }],
    volunteerRoles: [
      { id: 'r5', title: 'Solar Workshop Lead', description: 'Train local youth in solar maintenance.', hoursNeeded: 20, hoursPledged: 12, type: 'On-site', skills: ['Electrical Engineering', 'Mentorship'] }
    ]
  },
  {
    id: 'proj-5',
    name: 'Mobile Healthcare & Preventive Camps',
    charity: 'HealthFirst India',
    location: 'Pune, Maharashtra',
    match: '88% Match',
    tags: ['Healthcare', 'Community', 'Sanitation'],
    description: 'Support doctors and health workers in conducting free health checkups, eye screenings, and diabetes detection camps for daily wage workers.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    vision: 'Accessible healthcare at the doorstep for underprivileged communities.',
    aboutCharity: 'HealthFirst India operates mobile medical clinics across 12 states.',
    website: 'https://healthfirstindia.org',
    contact: { email: 'camps@healthfirstindia.org', phone: '+91 91234 56789', person: 'Dr. Meera Sen' },
    guidelines: [{ title: 'Medical Camp Protocol.pdf', size: '1.5 MB', type: 'PDF' }],
    volunteerRoles: [
      { id: 'r6', title: 'Camp Operations Assistant', description: 'Manage patient registration and queue logistics.', hoursNeeded: 15, hoursPledged: 10, type: 'On-site', skills: ['Public Speaking', 'Logistics'] }
    ]
  },
  {
    id: 'proj-6',
    name: 'Women Skill & Entrepreneurship Lab',
    charity: 'Stree Shakti Trust',
    location: 'Jaipur, Rajasthan',
    match: '86% Match',
    tags: ['Skill Development', 'Women Empowerment', 'Livelihood'],
    description: 'Provide vocational training in handicraft production, digital marketing, financial literacy, and online micro-business setup for women self-help groups.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    vision: 'Economic independence and digital financial access for 25,000 rural women entrepreneurs.',
    aboutCharity: 'Stree Shakti Trust creates self-sustaining micro-enterprises for women across rural North India.',
    website: 'https://streeshakti.org',
    contact: { email: 'shakti@streeshakti.org', phone: '+91 98989 12345', person: 'Sunita Sharma' },
    guidelines: [{ title: 'Micro Business Setup.pdf', size: '2.0 MB', type: 'PDF' }],
    volunteerRoles: [
      { id: 'r7', title: 'Business Mentor', description: 'Guide women SHGs in pricing, packaging, and Instagram marketing.', hoursNeeded: 12, hoursPledged: 8, type: 'Remote', skills: ['Marketing', 'Finance'] }
    ]
  }
];

export function DiscoverProjects() {
  const { addHours, userSkills } = useVolunteer();
  const [projectsData, setProjectsData] = useState<Project[]>(DEFAULT_DISCOVER_PROJECTS);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsQuery = query(collection(db, 'projects'), where('status', '==', 'approved'));
        const snap = await getDocs(projectsQuery);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        
        if (fetched.length > 0) {
          setProjectsData(fetched);
          const tags = Array.from(new Set(fetched.flatMap(p => p.tags || [])));
          setAllTags(tags);
        } else {
          setProjectsData(DEFAULT_DISCOVER_PROJECTS);
          const tags = Array.from(new Set(DEFAULT_DISCOVER_PROJECTS.flatMap(p => p.tags || [])));
          setAllTags(tags);
        }
      } catch (e) {
        console.error(e);
        setProjectsData(DEFAULT_DISCOVER_PROJECTS);
        const tags = Array.from(new Set(DEFAULT_DISCOVER_PROJECTS.flatMap(p => p.tags || [])));
        setAllTags(tags);
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
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocationMode, setSelectedLocationMode] = useState<string>('all');
  const [sharingProject, setSharingProject] = useState<any | null>(null);
  const [bulkRegisterProject, setBulkRegisterProject] = useState<any | null>(null);
  const [alertedProjects, setAlertedProjects] = useState<any[]>([]);

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

    const alertedProjs = localStorage.getItem('alertedProjects');
    if (alertedProjs) {
      try {
        setAlertedProjects(JSON.parse(alertedProjs));
      } catch(e) {}
    }
  }, []);

  const toggleProjectAlert = (e: React.MouseEvent, id: any, projectName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAlertedProjects(prev => {
      const isAlerted = prev.includes(id);
      const newAlerted = isAlerted ? prev.filter(pId => pId !== id) : [...prev, id];
      localStorage.setItem('alertedProjects', JSON.stringify(newAlerted));
      if (!isAlerted) {
        toast.success(`Spot Alert Activated for ${projectName}!`, {
          description: "We will notify you via email and push alert as soon as new volunteer spots or shifts open up."
        });
      } else {
        toast.info(`Spot alert deactivated for ${projectName}.`);
      }
      return newAlerted;
    });
  };

  const toggleSaveProject = (e: React.MouseEvent, id: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedProjects(prev => {
      const isSaved = prev.includes(id);
      const newSaved = isSaved ? prev.filter(pId => pId !== id) : [...prev, id];
      localStorage.setItem('savedProjects', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const toggleHideProject = (e: React.MouseEvent, id: any) => {
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

  const allSkills = Array.from(
    new Set<string>(
      projectsData.flatMap(p => (p.volunteerRoles || []).flatMap(r => (r.skills || []) as string[]))
    )
  ).filter(Boolean);

  const allLocations = Array.from(
    new Set(projectsData.map(p => p.location))
  ).filter(Boolean);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedSkills([]);
    setSelectedLocationMode('all');
  };

  const filteredProjects = projectsData.filter(project => {
    const projectSkills = (project.volunteerRoles || []).flatMap(r => r.skills || []);
    const projectTypes = (project.volunteerRoles || []).map(r => (r.type || '').toLowerCase());

    const matchesSearch = searchTerm === '' || 
                          project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.charity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          projectSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.some(tag => project.tags?.includes(tag));

    const matchesSkills = selectedSkills.length === 0 ||
                          selectedSkills.some(skill => projectSkills.includes(skill));

    const matchesLocationMode = selectedLocationMode === 'all' ||
      (selectedLocationMode === 'remote' ? projectTypes.includes('remote') || project.location.toLowerCase().includes('remote') :
       selectedLocationMode === 'onsite' ? projectTypes.includes('on-site') || !project.location.toLowerCase().includes('remote') :
       project.location === selectedLocationMode);

    const matchesVisibility = isCompanyAdmin || !hiddenProjects.includes(project.id as any);
                        
    return matchesSearch && matchesTags && matchesSkills && matchesLocationMode && matchesVisibility;
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
        {/* Comprehensive Search and Multi-Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search projects by cause, NGO, title, or skills..." 
                className="pl-9 h-10 text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Cause/Category Filter */}
              <Popover>
                <PopoverTrigger render={<Button variant="outline" className="h-10 text-xs gap-1.5 border-slate-200 bg-slate-50/50 hover:bg-slate-100" />}>
                  <Filter className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Cause</span>
                  {selectedTags.length > 0 && (
                    <Badge className="bg-indigo-600 text-white font-bold text-[10px] px-1.5 py-0 h-4 ml-0.5">
                      {selectedTags.length}
                    </Badge>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Search causes/tags..." className="text-xs" />
                    <CommandList>
                      <CommandEmpty>No causes found.</CommandEmpty>
                      <CommandGroup>
                        {allTags.map((tag) => (
                          <CommandItem
                            key={tag}
                            onSelect={() => toggleTag(tag)}
                            className="text-xs cursor-pointer"
                          >
                            <div className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300",
                              selectedTags.includes(tag)
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "opacity-50 [&_svg]:invisible"
                            )}>
                              <Check className="h-3 w-3" />
                            </div>
                            <span>{tag}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* 2. Skills Required Filter */}
              <Popover>
                <PopoverTrigger render={<Button variant="outline" className="h-10 text-xs gap-1.5 border-slate-200 bg-slate-50/50 hover:bg-slate-100" />}>
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Skills</span>
                  {selectedSkills.length > 0 && (
                    <Badge className="bg-indigo-600 text-white font-bold text-[10px] px-1.5 py-0 h-4 ml-0.5">
                      {selectedSkills.length}
                    </Badge>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-60 p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Search required skills..." className="text-xs" />
                    <CommandList>
                      <CommandEmpty>No skills found.</CommandEmpty>
                      <CommandGroup>
                        {allSkills.map((skill) => (
                          <CommandItem
                            key={skill}
                            onSelect={() => toggleSkill(skill)}
                            className="text-xs cursor-pointer"
                          >
                            <div className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300",
                              selectedSkills.includes(skill)
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "opacity-50 [&_svg]:invisible"
                            )}>
                              <Check className="h-3 w-3" />
                            </div>
                            <span>{skill}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* 3. Location / Mode Filter */}
              <Select value={selectedLocationMode} onValueChange={setSelectedLocationMode}>
                <SelectTrigger className="h-10 text-xs w-[175px] border-slate-200 bg-slate-50/50">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 mr-1.5 shrink-0" />
                  <SelectValue placeholder="Location / Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Locations & Modes</SelectItem>
                  <SelectItem value="remote" className="text-xs">💻 Remote Opportunities</SelectItem>
                  <SelectItem value="onsite" className="text-xs">📍 On-site Opportunities</SelectItem>
                  {allLocations.map(loc => (
                    <SelectItem key={loc} value={loc} className="text-xs">{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Switchers */}
              <TabsList className="h-10 border border-slate-200 bg-slate-100 p-0.5">
                <TabsTrigger value="grid" className="text-xs px-3 h-9"><Grid className="h-3.5 w-3.5 mr-1.5" /> Grid</TabsTrigger>
                <TabsTrigger value="map" className="text-xs px-3 h-9"><Map className="h-3.5 w-3.5 mr-1.5 text-indigo-600" /> Map View</TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs px-3 h-9"><CalendarIcon className="h-3.5 w-3.5 mr-1.5" /> Calendar</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Active Filters Bar */}
          {(selectedTags.length > 0 || selectedSkills.length > 0 || selectedLocationMode !== 'all' || searchTerm) && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-indigo-600" /> Active Filters:
              </span>

              {selectedTags.map(tag => (
                <Badge key={tag} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 text-[11px] gap-1 px-2 py-0.5">
                  Cause: {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleTag(tag)} />
                </Badge>
              ))}

              {selectedSkills.map(skill => (
                <Badge key={skill} className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 text-[11px] gap-1 px-2 py-0.5">
                  Skill: {skill}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSkill(skill)} />
                </Badge>
              ))}

              {selectedLocationMode !== 'all' && (
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[11px] gap-1 px-2 py-0.5">
                  Mode: {selectedLocationMode === 'remote' ? 'Remote' : selectedLocationMode === 'onsite' ? 'On-site' : selectedLocationMode}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedLocationMode('all')} />
                </Badge>
              )}

              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="h-6 px-2 text-[11px] text-slate-500 hover:text-red-600 font-medium"
              >
                Clear All
              </Button>
            </div>
          )}
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
                <img src={project.image || (project as any).imageUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'} alt={project.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                <button 
                  onClick={(e) => toggleProjectAlert(e, project.id, project.name)}
                  className={`absolute top-3 ${isCompanyAdmin ? 'right-24' : 'right-12'} bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors`}
                  title={alertedProjects.includes(project.id) ? "Spot alerts active - click to turn off" : "Alert me when new volunteer spots open up"}
                >
                  {alertedProjects.includes(project.id) ? (
                    <BellRing className="h-4 w-4 fill-amber-500 text-amber-600" />
                  ) : (
                    <Bell className="h-4 w-4 text-gray-500" />
                  )}
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
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" className="flex-1 text-gray-700" />}>
                        View Full Details
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader className="flex flex-row items-start justify-between gap-4">
                          <div>
                            <DialogTitle className="text-2xl">{project.name}</DialogTitle>
                            <DialogDescription className="text-base">
                              {project.location} • By {project.charity}
                            </DialogDescription>
                          </div>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setSharingProject(project)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 font-semibold gap-1.5 shrink-0"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Share
                          </Button>
                        </DialogHeader>
                        
                        <div className="py-4">
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList className="mb-4 flex-wrap">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="testimonials">⭐ Testimonials</TabsTrigger>
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
                                  <img src={project.image || (project as any).imageUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'} alt={project.name} className="w-full h-64 object-cover rounded-lg" referrerPolicy="no-referrer" />
                                  
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

                            <TabsContent value="testimonials" className="mt-4">
                              <ProjectTestimonials projectId={project.id.toString()} projectName={project.name} />
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

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSharingProject(project)}
                    className="h-10 w-10 text-indigo-600 border-indigo-200 hover:bg-indigo-50 shrink-0"
                    title="Share Project"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <Button
                      variant="outline"
                      onClick={() => setBulkRegisterProject(project)}
                      className="bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border-indigo-200 font-semibold text-xs gap-1 flex-1 h-9"
                      title="Bulk register your team or department"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600" /> Team Sign-up
                    </Button>

                    <Button
                      variant={alertedProjects.includes(project.id) ? "default" : "outline"}
                      onClick={(e) => toggleProjectAlert(e, project.id, project.name)}
                      className={`text-xs gap-1 h-9 ${alertedProjects.includes(project.id) ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold' : 'border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100'}`}
                      title="Alert me when new volunteer spots open up"
                    >
                      {alertedProjects.includes(project.id) ? (
                        <>
                          <BellRing className="w-3.5 h-3.5 fill-white" /> Spot Alert On
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-amber-600" /> Alert Me
                        </>
                      )}
                    </Button>

                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs h-9" />}>
                        {isCompanyAdmin ? 'Manage' : 'Volunteer'}
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
        
        <TabsContent value="map" className="m-0">
          <ProjectMapView projects={filteredProjects} onSelectProject={(p) => setSharingProject(p)} />
        </TabsContent>

        <TabsContent value="calendar" className="m-0">
          <SharedProjectCalendarView projects={projectsData} />
        </TabsContent>
      </Tabs>

      {sharingProject && (
        <ProjectShareModal
          isOpen={!!sharingProject}
          onClose={() => setSharingProject(null)}
          project={sharingProject}
        />
      )}

      {bulkRegisterProject && (
        <BulkRegistrationModal
          isOpen={!!bulkRegisterProject}
          onClose={() => setBulkRegisterProject(null)}
          project={bulkRegisterProject}
        />
      )}
    </div>
  );
}
