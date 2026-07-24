import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, Clock, Calendar, Award, X, Sparkles, Plus, ArrowRight, 
  CheckCircle2, Trophy, Star, Heart, MapPin, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import { useVolunteer, AVAILABLE_BADGES } from '@/src/contexts/VolunteerContext';
import { useNavigate } from 'react-router';
import { MILESTONE_BADGES } from '@/src/components/BadgesAndMilestonesSection';

interface QuickActionsFloatingMenuProps {
  pledgedProjects?: Array<{
    id: string | number;
    title: string;
    category?: string;
    location?: string;
    date?: string;
  }>;
}

export function QuickActionsFloatingMenu({ pledgedProjects = [] }: QuickActionsFloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'log_hours' | 'upcoming_projects' | 'badge_progress' | null>(null);

  const { totalHours, addHours, earnedBadges } = useVolunteer();
  const navigate = useNavigate();

  // Log Hours Form State
  const [logProjectName, setLogProjectName] = useState('');
  const [logHoursAmount, setLogHoursAmount] = useState<number>(2);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logDescription, setLogDescription] = useState('');

  const handleLogHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logProjectName.trim()) {
      toast.error('Please enter or select a project name');
      return;
    }
    if (logHoursAmount <= 0) {
      toast.error('Please enter a valid number of hours');
      return;
    }

    addHours(logHoursAmount, logProjectName);
    toast.success(`🎉 Logged ${logHoursAmount} hours for "${logProjectName}"!`, {
      description: 'Your contribution has been recorded and updated in your CSR impact dashboard.',
      duration: 5000,
    });

    // Reset and close
    setLogProjectName('');
    setLogHoursAmount(2);
    setLogDescription('');
    setActiveModal(null);
    setIsOpen(false);
  };

  // Badge calculations
  const unlockedMilestones = MILESTONE_BADGES.filter(b => totalHours >= b.requiredHours);
  const nextMilestone = MILESTONE_BADGES.find(b => totalHours < b.requiredHours);

  // Default sample pledged projects if none passed
  const sampleProjects = pledgedProjects.length > 0 ? pledgedProjects : [
    { id: '1', title: 'Urban Riverbank Cleanliness Drive', category: 'Environment', location: 'Riverside Park', date: 'Sat, Aug 2, 2026' },
    { id: '2', title: 'Tech Skills Workshop for Youth', category: 'Education', location: 'Community Center', date: 'Wed, Aug 12, 2026' },
    { id: '3', title: 'Community Greenery Tree Plantation', category: 'Sustainability', location: 'City Sector 4', date: 'Sat, Aug 22, 2026' },
  ];

  return (
    <>
      {/* Floating Speed-Dial Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Expanded Popup Menu */}
        {isOpen && (
          <div className="mb-3 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-indigo-900/50">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none">Quick Actions</h4>
                  <p className="text-[10px] text-indigo-200 mt-0.5">Fast employee shortcuts</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Items List */}
            <div className="p-2 space-y-1">
              
              {/* Option 1: Log Hours */}
              <button
                onClick={() => {
                  setActiveModal('log_hours');
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-slate-800/80 transition-all flex items-center gap-3 group border border-transparent hover:border-indigo-100"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      Log Volunteer Hours
                    </span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                      Fast Form
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Record hours & contribution notes
                  </p>
                </div>
              </button>

              {/* Option 2: Upcoming Projects */}
              <button
                onClick={() => {
                  setActiveModal('upcoming_projects');
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 transition-all flex items-center gap-3 group border border-transparent hover:border-emerald-100"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      Upcoming Projects
                    </span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                      {sampleProjects.length} Drives
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    View pledged drives & event dates
                  </p>
                </div>
              </button>

              {/* Option 3: Badge Progress */}
              <button
                onClick={() => {
                  setActiveModal('badge_progress');
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-amber-50/80 dark:hover:bg-slate-800/80 transition-all flex items-center gap-3 group border border-transparent hover:border-amber-100"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      Check Badge Progress
                    </span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-50 text-amber-800 border-amber-200">
                      {totalHours} hrs
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {unlockedMilestones.length} badges earned · See next target
                  </p>
                </div>
              </button>

            </div>

            {/* Bottom Footer Link */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
              <button 
                onClick={() => {
                  navigate('/employee/impact');
                  setIsOpen(false);
                }}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center justify-center gap-1 mx-auto"
              >
                Go to Full Impact Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-12 px-5 rounded-full shadow-2xl transition-all duration-300 font-bold text-xs flex items-center gap-2.5 ${
            isOpen 
              ? 'bg-slate-900 text-white hover:bg-slate-800 ring-2 ring-slate-400' 
              : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white shadow-indigo-500/30 hover:scale-105 active:scale-95 border border-indigo-400/30'
          }`}
        >
          {isOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>Close</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span>Quick Actions</span>
            </>
          )}
        </Button>
      </div>

      {/* MODAL 1: Log Volunteer Hours */}
      <Dialog open={activeModal === 'log_hours'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">Log Volunteer Hours</DialogTitle>
                <DialogDescription className="text-xs text-blue-200">
                  Record your volunteering contribution to update your corporate impact scorecard.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleLogHoursSubmit} className="p-5 space-y-4 bg-white">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">CSR Project / Cause Name *</Label>
              <Input
                placeholder="e.g., Urban Riverbank Cleanliness Drive"
                value={logProjectName}
                onChange={(e) => setLogProjectName(e.target.value)}
                required
                className="text-xs"
              />
              {sampleProjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] text-gray-400 font-medium">Suggestions:</span>
                  {sampleProjects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setLogProjectName(p.title)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium"
                    >
                      + {p.title.slice(0, 22)}...
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Hours Logged *</Label>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={logHoursAmount}
                  onChange={(e) => setLogHoursAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="text-xs font-bold text-indigo-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Date Completed</Label>
                <Input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Activity Notes / Impact Description</Label>
              <Textarea
                placeholder="Briefly describe what tasks you performed or outcomes achieved..."
                value={logDescription}
                onChange={(e) => setLogDescription(e.target.value)}
                rows={3}
                className="text-xs resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveModal(null)} 
                className="text-xs"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit Hours
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Upcoming & Pledged Projects */}
      <Dialog open={activeModal === 'upcoming_projects'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">Upcoming & Pledged Projects</DialogTitle>
                <DialogDescription className="text-xs text-emerald-200">
                  Fast access to your pledged drives and registered CSR activities.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-3 bg-white max-h-[380px] overflow-y-auto">
            {sampleProjects.map((p) => (
              <div 
                key={p.id} 
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-bold mb-1">
                      {p.category || 'CSR Drive'}
                    </Badge>
                    <h4 className="text-sm font-bold text-gray-900">{p.title}</h4>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-white text-slate-700">
                    Pledged
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {p.date || 'Upcoming'}
                  </span>
                  {p.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> {p.location}
                    </span>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button 
                onClick={() => {
                  navigate('/employee/discover');
                  setActiveModal(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Explore All CSR Projects
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Check Badge Progress */}
      <Dialog open={activeModal === 'badge_progress'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-5 bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 text-white">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">Badge & Milestone Progress</DialogTitle>
                <DialogDescription className="text-xs text-amber-200">
                  Track earned digital badges and your distance to the next level.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-4 bg-white">
            {/* Total Hours Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider block">Logged Volunteer Hours</span>
                <span className="text-2xl font-black text-gray-900">{totalHours} Hours</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-indigo-700 uppercase font-bold tracking-wider block">Unlocked Badges</span>
                <span className="text-xl font-bold text-indigo-900">{unlockedMilestones.length} / {MILESTONE_BADGES.length}</span>
              </div>
            </div>

            {/* Next Milestone Card */}
            {nextMilestone ? (
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Next Target: {nextMilestone.title}
                  </span>
                  <span className="text-indigo-200 font-mono text-[11px]">
                    {nextMilestone.requiredHours - totalHours} hrs left
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, Math.round((totalHours / nextMilestone.requiredHours) * 100))}
                  className="h-2 bg-slate-800 [&>div]:bg-amber-400"
                />
                <p className="text-[11px] text-slate-300">
                  {nextMilestone.description}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-900 text-white text-center">
                <Sparkles className="w-6 h-6 text-amber-300 mx-auto mb-1" />
                <h4 className="font-bold text-sm">Master Legend Status Achieved!</h4>
                <p className="text-xs text-emerald-200 mt-0.5">You have unlocked all top tier milestone badges.</p>
              </div>
            )}

            {/* Unlocked Badges List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Earned Badges ({unlockedMilestones.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {unlockedMilestones.map((b) => (
                  <div key={b.id} className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-gray-900 block truncate">{b.title}</span>
                      <span className="text-[10px] text-amber-800 font-medium">{b.requiredHours}h milestone</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button 
                onClick={() => {
                  navigate('/employee/impact');
                  setActiveModal(null);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Go to Full Badges & Milestones Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
