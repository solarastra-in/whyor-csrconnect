import { EmptyState } from '@/src/components/EmptyState';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Activity, Sparkles, Calendar, UserPlus, Trophy, Award, Clock, 
  Plus, Filter, CheckCircle2, Building2, Heart, Zap, RefreshCw, 
  Layers, ArrowRight, ShieldCheck, ThumbsUp 
} from 'lucide-react';
import { toast } from 'sonner';
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'employee_signup' | 'milestone_completed';
  title: string;
  description: string;
  actorName: string;
  actorRole?: string;
  actorAvatar?: string;
  department?: string;
  timestamp: string;
  badgeTag?: string;
  meta?: {
    location?: string;
    hoursLogged?: number;
    projectName?: string;
  };
}

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'employee_signup' | 'milestone_completed';
  title: string;
  description: string;
  actorName: string;
  actorRole?: string;
  actorAvatar?: string;
  department?: string;
  timestamp: string;
  badgeTag?: string;
  meta?: {
    location?: string;
    hoursLogged?: number;
    projectName?: string;
  };
}

export function CompanyRecentActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Custom Activity Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityType, setActivityType] = useState<'project_created' | 'employee_signup' | 'milestone_completed'>('project_created');
  const [actorName, setActorName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  useEffect(() => {
    fetchRealActivities();
  }, []);

  const fetchRealActivities = async () => {
    setIsRefreshing(true);
    try {
      const fetchedActs: ActivityItem[] = [];

      // 1. Fetch commitments (employee_signup)
      const commitmentsSnap = await getDocs(collection(db, 'commitments'));
      commitmentsSnap.docs.forEach(doc => {
        const d = doc.data();
        fetchedActs.push({
          id: doc.id,
          type: 'employee_signup',
          title: `Pledged for ${d.projectName || 'CSR Activity'}`,
          description: `Pledged ${d.hoursPledged || 0} hours of volunteering.`,
          actorName: d.userName || d.userEmail || 'Employee',
          department: d.department || 'Corporate Member',
          timestamp: 'Recently',
          badgeTag: 'Volunteer Pledged',
          meta: { hoursLogged: d.hoursPledged, projectName: d.projectName }
        });
      });

      // 2. Fetch projects (project_created)
      const projectsSnap = await getDocs(collection(db, 'projects'));
      projectsSnap.docs.forEach(doc => {
        const d = doc.data();
        fetchedActs.push({
          id: doc.id,
          type: 'project_created',
          title: `New Project: ${d.title || 'CSR Drive'}`,
          description: d.description || 'Community initiative published.',
          actorName: d.charityName || 'Partner NGO',
          department: d.category || 'CSR Program',
          timestamp: 'Recently',
          badgeTag: d.category || 'New Project',
          meta: { location: d.location }
        });
      });

      // 3. Fetch custom logged activities from companyActivities
      const customSnap = await getDocs(collection(db, 'companyActivities'));
      customSnap.docs.forEach(doc => {
        const d = doc.data();
        fetchedActs.push({
          id: doc.id,
          type: d.type || 'project_created',
          title: d.title,
          description: d.description,
          actorName: d.actorName,
          department: d.department,
          timestamp: 'Recently',
          badgeTag: d.badgeTag || 'Logged Activity'
        });
      });

      setActivities(fetchedActs);
    } catch (e) {
      console.error('Error fetching real activities:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRealActivities();
    toast.success('Live activity feed updated from database');
  };

  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actorName.trim() || !customTitle.trim()) {
      toast.error('Please complete required fields');
      return;
    }

    const badgeTags = {
      project_created: 'New CSR Project',
      employee_signup: 'Volunteer Pledged',
      milestone_completed: 'Milestone Unlocked'
    };

    const newActData = {
      type: activityType,
      title: customTitle.trim(),
      description: customDesc.trim() || 'Recorded via real-time company portal update.',
      actorName: actorName.trim(),
      department: department,
      badgeTag: badgeTags[activityType],
      createdAt: serverTimestamp()
    };

    try {
      const ref = await addDoc(collection(db, 'companyActivities'), newActData);
      setActivities(prev => [{ id: ref.id, ...newActData, timestamp: 'Just now' } as any, ...prev]);
      toast.success('Live activity logged to database!');
    } catch (e) {
      toast.error('Failed to save activity');
    }

    // Reset
    setActorName('');
    setCustomTitle('');
    setCustomDesc('');
    setIsModalOpen(false);
  };

  const filteredActivities = activities.filter(a => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <Card className="border border-indigo-100 shadow-md overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                Real-Time Live Feed
              </Badge>
              <span className="text-xs text-indigo-200">Company Activity Stream</span>
            </div>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" /> Recent Company CSR Activities
            </CardTitle>
            <CardDescription className="text-xs text-indigo-200/80">
              Live updates on newly created projects, employee volunteer sign-ups, and milestone completions.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-8 gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs h-8 gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Log Event
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 pt-4 border-t border-indigo-900/60 mt-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'bg-white/10 text-indigo-200 hover:bg-white/20'
            }`}
          >
            All Updates ({activities.length})
          </button>

          <button
            onClick={() => setFilterType('project_created')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'project_created'
                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                : 'bg-white/10 text-indigo-200 hover:bg-white/20'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            New Projects ({activities.filter(a => a.type === 'project_created').length})
          </button>

          <button
            onClick={() => setFilterType('employee_signup')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'employee_signup'
                ? 'bg-blue-400 text-slate-950 shadow-sm'
                : 'bg-white/10 text-indigo-200 hover:bg-white/20'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Recent Sign-Ups ({activities.filter(a => a.type === 'employee_signup').length})
          </button>

          <button
            onClick={() => setFilterType('milestone_completed')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'milestone_completed'
                ? 'bg-purple-400 text-slate-950 shadow-sm'
                : 'bg-white/10 text-indigo-200 hover:bg-white/20'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Milestones ({activities.filter(a => a.type === 'milestone_completed').length})
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {filteredActivities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Recent Activity Recorded"
            description="No activity logs were found in the database. Invite team members to volunteer or start your first CSR campaign to generate real-time activity."
            actionLabel="Start Your First Campaign"
            actionHref="/admin"
            secondaryActionLabel="Log Event Manually"
            onSecondaryAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((act) => {
              // Style maps based on type
              const typeConfig = {
                project_created: {
                  icon: Building2,
                  color: 'text-emerald-600 bg-emerald-100 border-emerald-200',
                  badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  categoryLabel: 'New Project',
                },
                employee_signup: {
                  icon: UserPlus,
                  color: 'text-blue-600 bg-blue-100 border-blue-200',
                  badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
                  categoryLabel: 'Sign-up',
                },
                milestone_completed: {
                  icon: Trophy,
                  color: 'text-purple-600 bg-purple-100 border-purple-200',
                  badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
                  categoryLabel: 'Milestone',
                },
              }[act.type];

              const IconComponent = typeConfig.icon;

              return (
                <div
                  key={act.id}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/20 transition-all duration-200 flex items-start gap-3.5 group"
                >
                  {/* Type Icon Badge */}
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold border ${typeConfig.color} group-hover:scale-105 transition-transform`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 ${typeConfig.badgeBg}`}>
                            {typeConfig.categoryLabel}
                          </Badge>
                          {act.badgeTag && (
                            <Badge variant="outline" className="text-[10px] bg-white text-slate-700 border-slate-200">
                              {act.badgeTag}
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">
                          {act.title}
                        </h4>
                      </div>

                      <span className="text-[11px] text-gray-400 font-medium shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" /> {act.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {act.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-2 mt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <div className="h-4 w-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                          {act.actorName.charAt(0)}
                        </div>
                        {act.actorName}
                      </span>
                      {act.department && (
                        <span className="text-gray-400">· {act.department}</span>
                      )}
                      {act.meta?.location && (
                        <span className="text-emerald-700 font-medium">📍 {act.meta.location}</span>
                      )}
                      {act.meta?.hoursLogged && (
                        <span className="text-purple-700 font-medium">⚡ {act.meta.hoursLogged} hrs logged</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Manual Activity Log Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-400 text-slate-950 font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">Log Custom Real-Time Event</DialogTitle>
                <DialogDescription className="text-xs text-indigo-200">
                  Manually record a new project, employee sign-up, or milestone to the company activity stream.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddActivitySubmit} className="p-5 space-y-4 bg-white">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Event Type *</Label>
              <Select value={activityType} onValueChange={(val: any) => setActivityType(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_created">🏢 Newly Created Project</SelectItem>
                  <SelectItem value="employee_signup">🙋 Recent Employee Sign-Up</SelectItem>
                  <SelectItem value="milestone_completed">🏆 Employee Milestone Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Employee / Lead Name *</Label>
                <Input
                  placeholder="e.g. Alex Rivera"
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design & UX">Design & UX</SelectItem>
                    <SelectItem value="Corporate Sustainability">Sustainability</SelectItem>
                    <SelectItem value="People & Culture">People & Culture</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Event Headline / Title *</Label>
              <Input
                placeholder="e.g. Unlocked 75 Hours Master Volunteer Badge"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Details / Description</Label>
              <Input
                placeholder="Brief summary of the activity..."
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)} 
                className="text-xs"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" /> Publish Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
