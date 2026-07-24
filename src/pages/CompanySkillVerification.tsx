import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  CheckCircle2, XCircle, FileCheck, ExternalLink, Clock, Loader2, 
  ThumbsUp, Award, Sparkles, Plus, Search, Users, HeartHandshake, 
  Building2, MessageSquare, ShieldCheck, Filter 
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

interface PeerEndorsement {
  id: string;
  endorserName: string;
  endorserRole?: string;
  colleagueName: string;
  colleagueDepartment: string;
  skill: string;
  activity: string;
  endorsementNote: string;
  createdAt: string;
  agreeCount: number;
  agreedByMe?: boolean;
}

const SAMPLE_VOLUNTEER_ACTIVITIES = [
  'Urban Riverbank Cleanliness Drive',
  'Tech Skills Workshop for Youth',
  'Community Greenery & Tree Plantation',
  'Blood Donation & Medical Relief Camp',
  'Senior Citizen Digital Literacy Program',
  'Disaster Relief Food Distribution Drive',
];

const POPULAR_VOLUNTEER_SKILLS = [
  'Event Leadership & Coordination',
  'Technical Training & Mentorship',
  'First Aid & Emergency Response',
  'Logistics & Resource Management',
  'Public Speaking & Community Outreach',
  'Sign Language Translation',
  'Youth Mentorship & Coaching',
  'Environmental Sanitation & Waste Mgmt',
];

const INITIAL_PEER_ENDORSEMENTS: PeerEndorsement[] = [
  {
    id: 'pe-1',
    endorserName: 'Ananya Sharma',
    endorserRole: 'Senior Data Analyst',
    colleagueName: 'Sarah Jenkins',
    colleagueDepartment: 'Engineering',
    skill: 'Event Leadership & Coordination',
    activity: 'Urban Riverbank Cleanliness Drive',
    endorsementNote: 'Sarah flawlessly coordinated over 50 volunteers across 3 zones, ensuring safety gear was distributed and managing waste disposal logistics perfectly!',
    createdAt: '2026-07-22',
    agreeCount: 12,
  },
  {
    id: 'pe-2',
    endorserName: 'David Chen',
    endorserRole: 'Product Designer',
    colleagueName: 'Rohan Mehta',
    colleagueDepartment: 'Product & UX',
    skill: 'Youth Mentorship & Coaching',
    activity: 'Tech Skills Workshop for Youth',
    endorsementNote: 'Rohan spent 4 hours patiently teaching high school students basic coding concepts. His empathy and ability to simplify complex topics inspired the entire group!',
    createdAt: '2026-07-21',
    agreeCount: 8,
  },
  {
    id: 'pe-3',
    endorserName: 'Priya Patel',
    endorserRole: 'HR Manager',
    colleagueName: 'David Chen',
    colleagueDepartment: 'Design',
    skill: 'Sign Language Translation',
    activity: 'Senior Citizen Digital Literacy Program',
    endorsementNote: 'David provided real-time sign language assistance for hearing-impaired attendees, making our workshop genuinely inclusive for everyone.',
    createdAt: '2026-07-19',
    agreeCount: 15,
  },
  {
    id: 'pe-4',
    endorserName: 'Marcus Vance',
    endorserRole: 'DevOps Lead',
    colleagueName: 'Emily Taylor',
    colleagueDepartment: 'Operations',
    skill: 'First Aid & Emergency Response',
    activity: 'Blood Donation & Medical Relief Camp',
    endorsementNote: 'Emily quickly handled a minor hydration emergency during the drive with calm professionalism and certified medical care.',
    createdAt: '2026-07-18',
    agreeCount: 6,
  }
];

export function CompanySkillVerification() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<PeerEndorsement[]>(INITIAL_PEER_ENDORSEMENTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'peer_endorsements' | 'official_verifications'>('peer_endorsements');

  // Search & Filter state for Endorsements
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');

  // Endorsement Modal Form State
  const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false);
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeDepartment, setNomineeDepartment] = useState('Engineering');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [endorsementNote, setEndorsementNote] = useState('');

  useEffect(() => {
    if (user) {
      fetchVerifications();
      fetchPeerEndorsements();
    }
  }, [user]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const companyDomain = user?.email?.split('@')[1];
      if (!companyDomain) return;

      const q = query(collection(db, 'skillVerifications'), where('companyDomain', '==', companyDomain));
      const snapshot = await getDocs(q);
      
      let data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Seed with mock data if empty
      if (data.length === 0) {
        data = [
          {
            id: 'mock-1',
            employeeName: 'Sarah Jenkins',
            department: 'Engineering',
            skill: 'First Aid / CPR',
            submittedAt: '2026-06-28',
            status: 'pending',
            proofUrl: '#',
            notes: 'Completed American Red Cross certification'
          },
          {
            id: 'mock-2',
            employeeName: 'David Chen',
            department: 'Design',
            skill: 'Sign Language',
            submittedAt: '2026-06-29',
            status: 'pending',
            proofUrl: '#',
            notes: 'ASL Level 2 certification'
          }
        ];
      }
      
      setVerifications(data);
    } catch(e) {
      console.error(e);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeerEndorsements = async () => {
    try {
      const companyDomain = user?.email?.split('@')[1] || 'company.com';
      const q = query(collection(db, 'peerEndorsements'), where('companyDomain', '==', companyDomain));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const remoteData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PeerEndorsement));
        setEndorsements(prev => [...remoteData, ...INITIAL_PEER_ENDORSEMENTS]);
      }
    } catch (e) {
      console.error('Peer endorsements fetch error:', e);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      if (id.startsWith('mock-')) {
        setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
        toast.success(`Skill ${newStatus}`);
        return;
      }
      
      await updateDoc(doc(db, 'skillVerifications', id), { status: newStatus });
      setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
      toast.success(`Skill ${newStatus}`);
    } catch(e) {
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  const handleAgreeEndorsement = (endorsementId: string) => {
    setEndorsements(prev => prev.map(item => {
      if (item.id === endorsementId) {
        const isAgreed = item.agreedByMe;
        return {
          ...item,
          agreeCount: isAgreed ? item.agreeCount - 1 : item.agreeCount + 1,
          agreedByMe: !isAgreed
        };
      }
      return item;
    }));
    toast.success('Endorsement agreement updated!');
  };

  const handleCreateEndorsementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeName.trim()) {
      toast.error('Please enter colleague name');
      return;
    }
    const finalSkill = selectedSkill === 'other' ? customSkill : selectedSkill;
    if (!finalSkill.trim()) {
      toast.error('Please select or specify a skill');
      return;
    }
    const finalActivity = selectedActivity === 'other' ? customActivity : selectedActivity;
    if (!finalActivity.trim()) {
      toast.error('Please select or specify a volunteer activity');
      return;
    }
    if (!endorsementNote.trim()) {
      toast.error('Please enter a brief recommendation note');
      return;
    }

    const newEndorsement: PeerEndorsement = {
      id: `pe-${Date.now()}`,
      endorserName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous Colleague',
      endorserRole: 'Team Member',
      colleagueName: nomineeName.trim(),
      colleagueDepartment: nomineeDepartment,
      skill: finalSkill.trim(),
      activity: finalActivity.trim(),
      endorsementNote: endorsementNote.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      agreeCount: 1,
      agreedByMe: true,
    };

    // Save locally
    setEndorsements(prev => [newEndorsement, ...prev]);

    // Try save to firestore
    try {
      const companyDomain = user?.email?.split('@')[1] || 'company.com';
      await addDoc(collection(db, 'peerEndorsements'), {
        ...newEndorsement,
        companyDomain,
      });
    } catch (err) {
      console.error('Firestore save failed:', err);
    }

    toast.success(`🎉 Endorsed ${nomineeName} for "${finalSkill}"!`, {
      description: 'Your peer skill endorsement has been published to the company recognition wall.',
      duration: 5000,
    });

    // Reset form
    setNomineeName('');
    setSelectedSkill('');
    setCustomSkill('');
    setSelectedActivity('');
    setCustomActivity('');
    setEndorsementNote('');
    setIsEndorseModalOpen(false);
  };

  const filteredEndorsements = endorsements.filter(e => {
    const matchesSearch = 
      e.colleagueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.endorserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.activity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill = selectedSkillFilter === 'all' || e.skill === selectedSkillFilter;

    return matchesSearch && matchesSkill;
  });

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 text-xs flex items-center gap-1 border-0">
              <Award className="w-3.5 h-3.5" /> Peer Recognition
            </Badge>
            <span className="text-xs text-indigo-200 font-medium">CSR Skill Verification & Endorsements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Colleague Skill Endorsements
          </h1>
          <p className="text-sm text-indigo-200/80 max-w-2xl">
            Recognize and validate skills demonstrated by colleagues during corporate volunteer drives, or review HR verification requests.
          </p>
        </div>

        <Button 
          onClick={() => setIsEndorseModalOpen(true)}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold shadow-lg gap-2 text-xs sm:text-sm h-11 px-5"
        >
          <Sparkles className="w-4 h-4 text-slate-950" /> Endorse a Colleague
        </Button>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="peer_endorsements" value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl grid grid-cols-2 max-w-md">
          <TabsTrigger 
            value="peer_endorsements" 
            className="rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-900 shadow-xs"
          >
            <HeartHandshake className="w-4 h-4 text-amber-500" />
            Peer Endorsements ({endorsements.length})
          </TabsTrigger>

          <TabsTrigger 
            value="official_verifications" 
            className="rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-900 shadow-xs relative"
          >
            <FileCheck className="w-4 h-4 text-blue-600" />
            HR Verifications
            {pendingCount > 0 && (
              <Badge className="ml-1 bg-rose-500 text-white border-0 text-[10px] px-1.5 py-0">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PEER SKILL ENDORSEMENTS */}
        <TabsContent value="peer_endorsements" className="space-y-6 mt-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-amber-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Total Peer Endorsements</span>
                  <span className="text-2xl font-black text-gray-900">{endorsements.length}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border-indigo-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">Top Recognized Skill</span>
                  <span className="text-sm font-extrabold text-gray-900 truncate block max-w-[180px]">
                    Event Leadership
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-emerald-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Agreed Recommendations</span>
                  <span className="text-2xl font-black text-gray-900">
                    {endorsements.reduce((acc, curr) => acc + curr.agreeCount, 0)} 👍
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <ThumbsUp className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <Input
                placeholder="Search by colleague, skill, or drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={selectedSkillFilter} onValueChange={setSelectedSkillFilter}>
                <SelectTrigger className="w-[200px] text-xs">
                  <SelectValue placeholder="Filter by Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {POPULAR_VOLUNTEER_SKILLS.map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Endorsement Cards Grid */}
          {filteredEndorsements.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <HeartHandshake className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <h3 className="text-sm font-bold text-gray-900">No Endorsements Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No peer endorsements match your search criteria. Be the first to endorse a colleague!
              </p>
              <Button 
                onClick={() => setIsEndorseModalOpen(true)} 
                size="sm" 
                className="mt-4 bg-indigo-600 text-white text-xs font-bold gap-1.5"
              >
                <Plus className="w-4 h-4" /> Endorse a Colleague
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEndorsements.map((item) => (
                <Card 
                  key={item.id} 
                  className="border border-slate-200/80 hover:border-amber-300 transition-all duration-200 shadow-sm hover:shadow-md bg-white flex flex-col justify-between overflow-hidden"
                >
                  <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                          {item.colleagueName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-gray-900 leading-none">
                              {item.colleagueName}
                            </h3>
                            <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
                              {item.colleagueDepartment}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Endorsed by <strong className="text-indigo-900">{item.endorserName}</strong> ({item.endorserRole || 'Team Member'})
                          </p>
                        </div>
                      </div>

                      <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-0 text-[10px] font-bold px-2.5 py-0.5 shrink-0 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" /> Skill Validated
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-indigo-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg">
                          {item.skill}
                        </Badge>
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" /> {item.activity}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
                        <MessageSquare className="w-4 h-4 text-indigo-300 absolute top-3 left-3 opacity-40" />
                        <p className="text-xs text-slate-700 italic leading-relaxed pl-5">
                          "{item.endorsementNote}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500">
                      <span className="text-[11px] text-gray-400">
                        {item.createdAt}
                      </span>

                      <Button
                        onClick={() => handleAgreeEndorsement(item.id)}
                        variant={item.agreedByMe ? "default" : "outline"}
                        size="sm"
                        className={`h-8 text-xs font-bold gap-1.5 transition-all ${
                          item.agreedByMe 
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-xs' 
                            : 'text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${item.agreedByMe ? 'fill-slate-950' : ''}`} />
                        <span>{item.agreedByMe ? 'Agreed' : 'Agree / Second'}</span>
                        <Badge variant="secondary" className="ml-1 bg-white/30 text-slate-950 text-[10px] px-1 py-0 font-extrabold">
                          {item.agreeCount}
                        </Badge>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        </TabsContent>

        {/* TAB 2: HR OFFICIAL VERIFICATIONS */}
        <TabsContent value="official_verifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                Pending Certificate Reviews
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">{pendingCount}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Employees have uploaded formal proofs for specialized skills. HR/Company admins review and verify them here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
              ) : pendingCount === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-sm font-medium text-gray-900">All caught up!</h3>
                  <p className="text-sm text-gray-500 mt-1">No pending HR skill verifications.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifications.filter(v => v.status === 'pending').map((verification) => (
                    <div key={verification.id} className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                          {verification.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{verification.employeeName}</h4>
                          <p className="text-sm text-gray-500 mb-2">{verification.department}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {verification.skill}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> Submitted {verification.submittedAt}
                            </span>
                          </div>
                          
                          {verification.notes && (
                            <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                              "{verification.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.open(verification.proofUrl, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" /> View Proof
                        </Button>
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" size="sm" className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100" onClick={() => handleStatusUpdate(verification.id, 'approved')}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100" onClick={() => handleStatusUpdate(verification.id, 'rejected')}>
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ENDORSE A COLLEAGUE MODAL DIALOG */}
      <Dialog open={isEndorseModalOpen} onOpenChange={setIsEndorseModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">Endorse a Colleague</DialogTitle>
                <DialogDescription className="text-xs text-indigo-200">
                  Recognize a team member for skills demonstrated during corporate volunteer activities.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateEndorsementSubmit} className="p-6 space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Colleague Name *</Label>
                <Input
                  placeholder="e.g. Sarah Jenkins"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Department</Label>
                <Select value={nomineeDepartment} onValueChange={setNomineeDepartment}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design & UX</SelectItem>
                    <SelectItem value="Product & UX">Product & Marketing</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Operations">Operations & Logistics</SelectItem>
                    <SelectItem value="Sales & Finance">Sales & Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Volunteer Activity Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Volunteer Activity / CSR Drive *</Label>
              <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select CSR activity..." />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_VOLUNTEER_ACTIVITIES.map((act) => (
                    <SelectItem key={act} value={act}>{act}</SelectItem>
                  ))}
                  <SelectItem value="other">+ Specify Other Activity...</SelectItem>
                </SelectContent>
              </Select>
              {selectedActivity === 'other' && (
                <Input
                  placeholder="Enter custom volunteer drive name..."
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  className="text-xs mt-1.5"
                  required
                />
              )}
            </div>

            {/* Demonstrated Skill Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Demonstrated Skill *</Label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select demonstrated skill..." />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_VOLUNTEER_SKILLS.map((sk) => (
                    <SelectItem key={sk} value={sk}>{sk}</SelectItem>
                  ))}
                  <SelectItem value="other">+ Specify Other Skill...</SelectItem>
                </SelectContent>
              </Select>
              {selectedSkill === 'other' && (
                <Input
                  placeholder="Enter custom skill name..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="text-xs mt-1.5"
                  required
                />
              )}
            </div>

            {/* Endorsement Recommendation Note */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Recommendation & Testimonial *</Label>
              <Textarea
                placeholder="Describe how your colleague demonstrated this skill on site..."
                value={endorsementNote}
                onChange={(e) => setEndorsementNote(e.target.value)}
                rows={3}
                required
                className="text-xs resize-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEndorseModalOpen(false)} 
                className="text-xs"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-slate-950" /> Publish Endorsement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
