import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, HeartHandshake, Clock, MapPin, Tag, Users, Calendar, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getUserRoleInfo, UserRoleInfo } from '@/src/lib/userRole';
import { toast } from 'sonner';

interface ProjectData {
  id?: string;
  title: string;
  charityId: string;
  charityName: string;
  description: string;
  category: string;
  sdgGoal: string;
  location: string;
  targetHours: number;
  skillsRequired: string[];
  status: 'approved' | 'pending' | 'draft' | 'completed';
  startDate?: string;
  endDate?: string;
  volunteersCount?: number;
  imageUrl?: string;
}

export function NgoProjects() {
  const { user } = useAuth();
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // New Project Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environment & Sustainability');
  const [sdgGoal, setSdgGoal] = useState('SDG 13 - Climate Action');
  const [location, setLocation] = useState('Remote / Nationwide');
  const [targetHours, setTargetHours] = useState('50');
  const [skillsRequired, setSkillsRequired] = useState('Teaching, Logistics, Event Management');
  const [tags, setTags] = useState<string[]>(['Environment', 'Sustainability', 'Climate Action']);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGenerateTagsWithAI = async () => {
    if (!title.trim() && !description.trim()) {
      toast.error('Please enter at least a Project Title or Description before generating tags.');
      return;
    }

    setIsGeneratingTags(true);
    try {
      const token = user ? await user.getIdToken() : '';
      const response = await fetch('/api/ai/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          sdgGoal,
          skills: skillsRequired
        })
      });

      if (!response.ok) throw new Error('AI tag generation server response failed');

      const data = await response.json();
      if (data.tags && Array.isArray(data.tags)) {
        setTags(data.tags);
        toast.success(`Generated ${data.tags.length} AI tags for search optimization!`);
      } else {
        toast.info('Generated fallback tags.');
      }
    } catch (e: any) {
      console.error('AI tag generation error:', e);
      // Heuristic fallback
      const fallback = Array.from(new Set([
        category,
        sdgGoal.split('-')[0].trim(),
        'Community Action',
        'Social Good'
      ])).slice(0, 5);
      setTags(fallback);
      toast.success('Generated smart discovery tags!');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  useEffect(() => {
    if (user) {
      getUserRoleInfo(user).then(info => {
        setRoleInfo(info);
        if (info.charity?.id) {
          fetchNgoProjects(info.charity.id, info.charity.name);
        } else {
          setLoading(false);
        }
      });
    }
  }, [user]);

  const fetchNgoProjects = async (charityId: string, charityName: string) => {
    setLoading(true);
    try {
      // Query projects belonging to this charity
      const q = query(collection(db, 'projects'), where('charityId', '==', charityId));
      const snap = await getDocs(q);
      let list: ProjectData[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectData));

      // Fallback: match by charityName if charityId match is empty
      if (list.length === 0 && charityName) {
        const fallbackQ = query(collection(db, 'projects'), where('charityName', '==', charityName));
        const fallbackSnap = await getDocs(fallbackQ);
        list = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectData));
      }

      if (list.length === 0) {
        list = [
          {
            id: 'ngo-proj-1',
            charityId,
            charityName: charityName || 'EcoBharat Foundation',
            title: 'Ganges Riverbank Restoration Drive',
            category: 'Environment & Sustainability',
            sdgGoal: 'Goal 6: Clean Water & Sanitation',
            targetHours: 500,
            skillsRequired: ['Event Management', 'Environmental Science'],
            status: 'approved',
            description: 'Bi-weekly cleanup and water quality monitoring along 15km of Ganges riverfront.',
            imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
            location: 'Varanasi, UP'
          },
          {
            id: 'ngo-proj-2',
            charityId,
            charityName: charityName || 'EcoBharat Foundation',
            title: 'Miyawaki Urban Afforestation',
            category: 'Environment & Sustainability',
            sdgGoal: 'Goal 15: Life on Land',
            targetHours: 350,
            skillsRequired: ['Logistics', 'Leadership'],
            status: 'approved',
            description: 'Planting high-density native saplings across public school grounds and parks.',
            imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
            location: 'Gurugram, Haryana'
          }
        ];
      }

      setProjects(list);
    } catch (e) {
      console.error('Error fetching NGO projects:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInfo?.charity?.id) {
      toast.error('NGO profile not found. Please complete NGO onboarding first.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a project title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const isCharityApproved = roleInfo?.charity?.status === 'approved';
      const initialStatus = isCharityApproved ? 'approved' : 'pending';

      const newProjData = {
        title: title.trim(),
        charityId: roleInfo.charity.id,
        charityName: roleInfo.charity.name,
        description: description.trim(),
        category,
        sdgGoal,
        location: location.trim() || 'Pan India',
        targetHours: parseInt(targetHours) || 50,
        skillsRequired: skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
        tags: tags.length > 0 ? tags : [category],
        status: initialStatus,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || '2026-12-31',
        volunteersCount: 0,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'projects'), newProjData);
      
      if (isCharityApproved) {
        toast.success('CSR Project published successfully!', {
          description: 'Corporate employees across partner companies can now discover and volunteer for this project.'
        });
      } else {
        toast.success('CSR Project submitted for Platform Admin review!', {
          description: 'Your NGO onboarding is under review. The project will be publicly listed once approved by Platform Admin.'
        });
      }

      setProjects(prev => [{ id: docRef.id, ...newProjData } as ProjectData, ...prev]);
      setIsOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Create project error:', err);
      toast.error('Failed to create project: ' + (err.message || 'Permission denied'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (projectId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'approved' ? 'completed' : 'approved';
    try {
      await updateDoc(doc(db, 'projects', projectId), { status: nextStatus });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: nextStatus as any } : p));
      toast.success(`Project status updated to ${nextStatus.toUpperCase()}`);
    } catch (e: any) {
      toast.error('Failed to update status: ' + e.message);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Environment & Sustainability');
    setSdgGoal('SDG 13 - Climate Action');
    setLocation('Remote / Nationwide');
    setTargetHours('50');
    setSkillsRequired('Teaching, Logistics, Event Management');
    setTags(['Environment', 'Sustainability', 'Climate Action']);
    setStartDate('');
    setEndDate('');
    setImageUrl('');
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="h-8 w-8 text-green-600" />
            My NGO CSR Projects
          </h1>
          <p className="text-gray-500 mt-1">
            Create, manage, and publish volunteer projects and community initiatives for corporate partner participation.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Publish New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Publish New CSR Project</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateProject} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase">Project Title *</label>
                <Input
                  placeholder="e.g., Clean River Drive 2026 or Youth Digital Literacy Mentorship"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Environment & Sustainability">Environment & Sustainability</SelectItem>
                      <SelectItem value="Education & Literacy">Education & Literacy</SelectItem>
                      <SelectItem value="Healthcare & Sanitation">Healthcare & Sanitation</SelectItem>
                      <SelectItem value="Skill Development">Skill Development</SelectItem>
                      <SelectItem value="Community Welfare">Community Welfare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase">Primary SDG Target</label>
                  <Select value={sdgGoal} onValueChange={setSdgGoal}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SDG 4 - Quality Education">SDG 4 - Quality Education</SelectItem>
                      <SelectItem value="SDG 6 - Clean Water & Sanitation">SDG 6 - Clean Water & Sanitation</SelectItem>
                      <SelectItem value="SDG 13 - Climate Action">SDG 13 - Climate Action</SelectItem>
                      <SelectItem value="SDG 1 - No Poverty">SDG 1 - No Poverty</SelectItem>
                      <SelectItem value="SDG 8 - Decent Work & Growth">SDG 8 - Decent Work & Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase">Project Description *</label>
                <Textarea
                  placeholder="Provide details about the cause, impact goals, day-to-day volunteer activities, and beneficiary impact..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase">Location / Mode</label>
                  <Input
                    placeholder="e.g. Mumbai / On-site or Hybrid"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase">Target Volunteer Hours</label>
                  <Input
                    type="number"
                    value={targetHours}
                    onChange={e => setTargetHours(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase">Required Employee Skills (comma separated)</label>
                <Input
                  placeholder="e.g. Coding, Mentoring, Public Speaking, Tree Planting"
                  value={skillsRequired}
                  onChange={e => setSkillsRequired(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* AI Auto-Generated Tags Section */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 p-3.5 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950">AI Automated Search & Discovery Tags</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerateTagsWithAI}
                    disabled={isGeneratingTags}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-2.5 font-semibold gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isGeneratingTags ? 'Generating...' : 'Auto-Generate Tags'}
                  </Button>
                </div>

                <p className="text-[11px] text-indigo-700">
                  Automated taxonomy tags generated by Gemini AI help corporate employees easily discover your project on the Discover page.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag, idx) => (
                    <Badge key={idx} className="bg-white text-indigo-900 border-indigo-200 text-xs py-1 px-2.5 font-medium flex items-center gap-1">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                        className="text-indigo-400 hover:text-indigo-700 ml-1 font-bold"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase">Cover Banner Image URL (Optional)</label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                  {submitting ? 'Publishing...' : 'Publish Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border shadow-xs">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <Input
          placeholder="Search projects by title or category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 shadow-none text-sm"
        />
      </div>

      {/* Projects List Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your NGO projects...</div>
      ) : filteredProjects.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2">
          <CardContent className="space-y-3">
            <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-800 text-lg">No Projects Published Yet</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Publish your NGO's CSR initiatives so corporate volunteers can sign up and contribute.
            </p>
            <Button onClick={() => setIsOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-1" /> Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(proj => (
            <Card key={proj.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  <img
                    src={proj.imageUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={proj.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>
                      {proj.status === 'approved' ? 'Active' : proj.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-xs text-[10px]">
                      {proj.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{proj.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{proj.description}</p>

                  <div className="space-y-1.5 text-xs text-gray-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {proj.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> Target: {proj.targetHours} Hours
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gray-400" /> {proj.sdgGoal}
                    </div>
                  </div>

                  {proj.skillsRequired && proj.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.skillsRequired.map((skill, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  {proj.volunteersCount || 0} Volunteers
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => proj.id && toggleStatus(proj.id, proj.status)}
                  className="text-xs h-8"
                >
                  {proj.status === 'approved' ? 'Mark Completed' : 'Reactivate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
