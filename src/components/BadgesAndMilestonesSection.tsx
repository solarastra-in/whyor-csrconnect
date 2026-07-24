import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Award, Trophy, Medal, Star, Clock, CheckCircle2, Lock, Sparkles, 
  Share2, Zap, ShieldCheck, Flame, Plus, ArrowRight, Download, Check 
} from 'lucide-react';
import { toast } from 'sonner';
import { useVolunteer } from '@/src/contexts/VolunteerContext';
import { useAuth } from '@/src/contexts/AuthContext';

export interface MilestoneBadge {
  id: string;
  requiredHours: number;
  title: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  description: string;
  impactNote: string;
  iconBg: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  xpPoints: number;
}

export const MILESTONE_BADGES: MilestoneBadge[] = [
  {
    id: 'm_1h',
    requiredHours: 1,
    title: 'First Spark',
    tier: 'Bronze',
    description: 'Logged your first official volunteer hour.',
    impactNote: 'Sparked community change through your first hours of service.',
    iconBg: 'from-amber-500 to-amber-700',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    badgeBg: 'bg-amber-100',
    xpPoints: 50,
  },
  {
    id: 'm_5h',
    requiredHours: 5,
    title: 'Dedicated Helper',
    tier: 'Silver',
    description: 'Completed 5 volunteering hours.',
    impactNote: 'Provided 5+ hours of hands-on support to local grassroots causes.',
    iconBg: 'from-slate-400 to-slate-600',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-800',
    badgeBg: 'bg-slate-200',
    xpPoints: 100,
  },
  {
    id: 'm_10h',
    requiredHours: 10,
    title: 'Impact Champion',
    tier: 'Gold',
    description: 'Crossed the 10-hour volunteering landmark.',
    impactNote: 'Demonstrated exceptional personal commitment to social welfare.',
    iconBg: 'from-yellow-400 to-amber-600',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-900',
    badgeBg: 'bg-yellow-100',
    xpPoints: 250,
  },
  {
    id: 'm_25h',
    requiredHours: 25,
    title: 'Community Pillar',
    tier: 'Platinum',
    description: 'Pledged and logged 25 volunteer hours.',
    impactNote: 'Positively impacted over 100+ community beneficiaries.',
    iconBg: 'from-indigo-500 to-purple-700',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-900',
    badgeBg: 'bg-indigo-100',
    xpPoints: 500,
  },
  {
    id: 'm_50h',
    requiredHours: 50,
    title: 'Visionary Leader',
    tier: 'Diamond',
    description: 'Achieved 50 volunteer hours milestone.',
    impactNote: 'Inspired company-wide participation as an active CSR mentor.',
    iconBg: 'from-cyan-400 to-blue-600',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-900',
    badgeBg: 'bg-cyan-100',
    xpPoints: 1000,
  },
  {
    id: 'm_100h',
    requiredHours: 100,
    title: 'CSR Legend',
    tier: 'Master',
    description: 'Crossed a legendary 100 volunteer hours.',
    impactNote: 'Transformed community ecosystems with long-term sustained leadership.',
    iconBg: 'from-emerald-400 via-teal-500 to-indigo-700',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-950',
    badgeBg: 'bg-emerald-100',
    xpPoints: 2500,
  },
];

export function BadgesAndMilestonesSection() {
  const { totalHours, addHours } = useVolunteer();
  const { user } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);
  const prevHoursRef = useRef<number>(totalHours);

  // Monitor totalHours to pop dynamic toast when milestone badges unlock
  useEffect(() => {
    const prev = prevHoursRef.current;
    if (totalHours > prev) {
      MILESTONE_BADGES.forEach((badge) => {
        if (prev < badge.requiredHours && totalHours >= badge.requiredHours) {
          toast.success(`🎉 NEW BADGE UNLOCKED: ${badge.title}!`, {
            description: `Congratulations! You reached ${badge.requiredHours} volunteer hours and earned ${badge.xpPoints} XP!`,
            duration: 6000,
          });
        }
      });
    }
    prevHoursRef.current = totalHours;
  }, [totalHours]);

  // Find current highest unlocked badge
  const unlockedBadges = MILESTONE_BADGES.filter(b => totalHours >= b.requiredHours);
  const nextLockedBadge = MILESTONE_BADGES.find(b => totalHours < b.requiredHours);
  const currentBadge = unlockedBadges[unlockedBadges.length - 1] || null;

  const handleSimulateHours = (amount: number) => {
    addHours(amount, 'Milestone Booster Drive');
    toast.info(`Logged +${amount} volunteer hours!`, {
      description: `New Total: ${totalHours + amount} hrs`
    });
  };

  const handleShareBadge = (badge: MilestoneBadge) => {
    const text = `I just unlocked the "${badge.title}" digital badge on CSR Connect for completing ${badge.requiredHours}+ volunteer hours! 🚀`;
    navigator.clipboard.writeText(text);
    toast.success('Achievement text copied to clipboard!', {
      description: 'Ready to share on LinkedIn or Slack.'
    });
  };

  return (
    <Card className="border border-indigo-100 shadow-md bg-gradient-to-b from-white via-indigo-50/20 to-white overflow-hidden my-6">
      {/* Top Banner Header */}
      <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative overflow-hidden border-b border-indigo-900">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award className="h-48 w-48 text-amber-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 text-xs flex items-center gap-1 border-0">
                <Trophy className="w-3.5 h-3.5" /> Badges & Milestones
              </Badge>
              <span className="text-xs text-indigo-200 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Dynamic Hours Gamification
              </span>
            </div>
            <CardTitle className="text-2xl font-extrabold text-white tracking-tight">
              Volunteering Milestone Badges
            </CardTitle>
            <CardDescription className="text-indigo-200 text-xs sm:text-sm">
              Digital badges unlock automatically as you log volunteering hours. Click any unlocked badge to view and share your official digital certificate.
            </CardDescription>
          </div>

          {/* User Milestone Snapshot Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex items-center gap-4 shrink-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
              {unlockedBadges.length}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider block">Earned Badges</span>
              <div className="text-lg font-bold text-white leading-tight">
                {currentBadge ? currentBadge.title : 'Beginner'}
              </div>
              <span className="text-xs text-amber-300 font-medium">
                {totalHours} Total Hours Logged
              </span>
            </div>
          </div>
        </div>

        {/* Next Milestone Progress Indicator */}
        {nextLockedBadge && (
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-indigo-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Next Milestone: <strong className="text-white font-semibold">{nextLockedBadge.title}</strong> ({nextLockedBadge.requiredHours}h)
              </span>
              <span className="text-amber-300 font-bold font-mono">
                {nextLockedBadge.requiredHours - totalHours} hours remaining
              </span>
            </div>
            <Progress 
              value={Math.min(100, Math.round((totalHours / nextLockedBadge.requiredHours) * 100))} 
              className="h-2 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-emerald-400"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        
        {/* Interactive Quick Hours Simulator Bar */}
        <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide block">Log Hours to Unlock Badges</span>
              <p className="text-xs text-gray-600">Simulate logging volunteer hours to test real-time badge unlocking:</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={() => handleSimulateHours(2)} 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> +2 Hours
            </Button>
            <Button 
              onClick={() => handleSimulateHours(5)} 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> +5 Hours
            </Button>
            <Button 
              onClick={() => handleSimulateHours(10)} 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-indigo-600 text-white hover:bg-indigo-700 font-semibold gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> +10 Hours
            </Button>
          </div>
        </div>

        {/* Milestone Badges Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Dynamic Hour Milestones ({unlockedBadges.length} / {MILESTONE_BADGES.length} Unlocked)
            </h3>
            <span className="text-xs text-gray-500">Click unlocked badge to view digital certificate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MILESTONE_BADGES.map((badge) => {
              const isUnlocked = totalHours >= badge.requiredHours;
              const progressPct = Math.min(100, Math.round((totalHours / badge.requiredHours) * 100));

              return (
                <Card 
                  key={badge.id} 
                  onClick={() => isUnlocked && setSelectedBadge(badge)}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isUnlocked 
                      ? 'border-2 border-indigo-200 bg-white hover:shadow-lg cursor-pointer hover:-translate-y-1' 
                      : 'border border-gray-200 bg-slate-50/70 opacity-80'
                  }`}
                >
                  {/* Top Status Header */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.iconBg} text-white flex items-center justify-center shadow-md relative shrink-0`}>
                        <Award className="w-6 h-6" />
                        {isUnlocked && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <Badge className={`${badge.badgeBg} ${badge.textColor} border-0 text-[10px] font-bold px-2 py-0.5`}>
                          {badge.tier} Tier
                        </Badge>
                        <span className="text-[11px] text-gray-400 font-mono font-medium block mt-1">
                          +{badge.xpPoints} XP
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                        {badge.title}
                        {!isUnlocked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>

                    {/* Progress Bar & Metric Requirement */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center text-[11px] font-medium text-gray-600 mb-1">
                        <span>{isUnlocked ? 'Requirement Met' : 'Progress'}</span>
                        <span className={isUnlocked ? 'text-emerald-600 font-bold' : 'text-gray-600'}>
                          {totalHours} / {badge.requiredHours} hrs ({progressPct}%)
                        </span>
                      </div>
                      <Progress 
                        value={progressPct} 
                        className={`h-1.5 ${isUnlocked ? '[&>div]:bg-emerald-500' : '[&>div]:bg-indigo-500'}`} 
                      />
                    </div>

                    {/* Action Footer Button */}
                    {isUnlocked ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2 h-8 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-medium gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> View Digital Certificate
                      </Button>
                    ) : (
                      <div className="text-center pt-1 text-[11px] text-gray-400 font-medium">
                        Log {badge.requiredHours - totalHours} more hrs to unlock
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

      </CardContent>

      {/* Digital Certificate Modal Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        {selectedBadge && (
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-2 border-amber-300">
            <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 text-white text-center relative border-b border-amber-400/30">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Trophy className="w-8 h-8 text-slate-950" />
              </div>
              <Badge className="bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-widest mb-1 border-0">
                Official Digital Achievement
              </Badge>
              <DialogTitle className="text-2xl font-extrabold text-white mt-1">
                {selectedBadge.title}
              </DialogTitle>
              <DialogDescription className="text-indigo-200 text-xs mt-1">
                Verified CSR Volunteering Milestone Certificate
              </DialogDescription>
            </div>

            <div className="p-6 bg-white space-y-4 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Awarded To</p>
                <h3 className="text-xl font-extrabold text-slate-900">{user?.displayName || 'Active Volunteer'}</h3>
                <p className="text-xs text-slate-600 italic">
                  "{selectedBadge.impactNote}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-900">
                  <span className="block text-[10px] text-indigo-500 uppercase font-semibold">Hours Milestone</span>
                  <strong className="text-base font-extrabold">{selectedBadge.requiredHours} Hours</strong>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg text-amber-900">
                  <span className="block text-[10px] text-amber-600 uppercase font-semibold">XP Awarded</span>
                  <strong className="text-base font-extrabold">+{selectedBadge.xpPoints} XP</strong>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => handleShareBadge(selectedBadge)} 
                  className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Copy & Share Text
                </Button>
                <Button 
                  onClick={() => {
                    toast.success('Certificate downloaded as PNG!');
                    setSelectedBadge(null);
                  }}
                  variant="outline" 
                  className="flex-1 text-xs font-semibold gap-1.5 text-slate-700"
                >
                  <Download className="w-3.5 h-3.5" /> Download Badge
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}
