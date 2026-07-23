import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Award, 
  Trophy, 
  Medal, 
  Star, 
  Target, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Share2, 
  Flame, 
  Zap, 
  Heart, 
  Check, 
  Plus, 
  Users, 
  TreePine, 
  BookOpen, 
  Droplets,
  HelpCircle,
  TrendingUp,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { useVolunteer } from '@/src/contexts/VolunteerContext';

export interface BadgeDefinition {
  id: string;
  title: string;
  category: 'hours' | 'challenges' | 'special';
  categoryLabel: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  tierColor: string;
  description: string;
  impactDetails: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  targetMetric: number;
  metricType: 'hours' | 'challenges' | 'amount';
  unit: string;
  challengeId?: string;
  points: number;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Volunteering Hours Badges
  {
    id: 'badge_1h',
    title: 'First Spark',
    category: 'hours',
    categoryLabel: 'Volunteering Hours',
    tier: 'Bronze',
    tierColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Logged your first official volunteer hour.',
    impactDetails: 'Taking the first step into community service creates a ripple effect of inspiration.',
    icon: <Sparkles className="h-6 w-6" />,
    iconBg: 'bg-amber-500/10 border-amber-200',
    iconColor: 'text-amber-600',
    targetMetric: 1,
    metricType: 'hours',
    unit: 'hours',
    points: 50
  },
  {
    id: 'badge_5h',
    title: 'Dedicated Helper',
    category: 'hours',
    categoryLabel: 'Volunteering Hours',
    tier: 'Silver',
    tierColor: 'bg-slate-200 text-slate-800 border-slate-300',
    description: 'Completed 5 volunteering hours.',
    impactDetails: '5 hours of dedicated volunteer time provides meaningful support to local grassroots initiatives.',
    icon: <Clock className="h-6 w-6" />,
    iconBg: 'bg-slate-500/10 border-slate-300',
    iconColor: 'text-slate-600',
    targetMetric: 5,
    metricType: 'hours',
    unit: 'hours',
    points: 100
  },
  {
    id: 'badge_10h',
    title: 'Impact Champion',
    category: 'hours',
    categoryLabel: 'Volunteering Hours',
    tier: 'Gold',
    tierColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    description: 'Reached 10 volunteer hours milestone.',
    impactDetails: 'A double-digit volunteer milestone showcasing deep personal commitment to social causes.',
    icon: <Trophy className="h-6 w-6" />,
    iconBg: 'bg-yellow-500/10 border-yellow-300',
    iconColor: 'text-yellow-600',
    targetMetric: 10,
    metricType: 'hours',
    unit: 'hours',
    points: 250
  },
  {
    id: 'badge_25h',
    title: 'Community Pillar',
    category: 'hours',
    categoryLabel: 'Volunteering Hours',
    tier: 'Platinum',
    tierColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Pledged and logged 25 volunteer hours.',
    impactDetails: '25 hours empowers over 100+ beneficiaries across education and environmental programs.',
    icon: <Medal className="h-6 w-6" />,
    iconBg: 'bg-indigo-500/10 border-indigo-300',
    iconColor: 'text-indigo-600',
    targetMetric: 25,
    metricType: 'hours',
    unit: 'hours',
    points: 500
  },
  {
    id: 'badge_100h',
    title: 'Century Leader',
    category: 'hours',
    categoryLabel: 'Volunteering Hours',
    tier: 'Diamond',
    tierColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    description: 'Achieved a legendary 100 volunteer hours.',
    impactDetails: 'Joined the elite tier of company changemakers with transformative long-term impact.',
    icon: <CrownIcon className="h-6 w-6" />,
    iconBg: 'bg-cyan-500/10 border-cyan-300',
    iconColor: 'text-cyan-600',
    targetMetric: 100,
    metricType: 'hours',
    unit: 'hours',
    points: 1500
  },

  // Challenge Completion Badges
  {
    id: 'badge_river_challenge',
    title: 'Clean Ganga Hero',
    category: 'challenges',
    categoryLabel: 'Challenge Completion',
    tier: 'Silver',
    tierColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Completed the River Restoration Challenge.',
    impactDetails: 'Participated in shoreline cleaning and waste audit drives preventing plastic river contamination.',
    icon: <Droplets className="h-6 w-6" />,
    iconBg: 'bg-blue-500/10 border-blue-300',
    iconColor: 'text-blue-600',
    targetMetric: 1,
    metricType: 'challenges',
    unit: 'challenge',
    challengeId: 'c_river',
    points: 150
  },
  {
    id: 'badge_tech_challenge',
    title: 'Digital Tutor',
    category: 'challenges',
    categoryLabel: 'Challenge Completion',
    tier: 'Gold',
    tierColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Completed Digital Literacy Mentorship Sprint.',
    impactDetails: 'Mentored underprivileged youth in computer skills, opening pathways to digital employment.',
    icon: <BookOpen className="h-6 w-6" />,
    iconBg: 'bg-purple-500/10 border-purple-300',
    iconColor: 'text-purple-600',
    targetMetric: 1,
    metricType: 'challenges',
    unit: 'challenge',
    challengeId: 'c_tech',
    points: 200
  },
  {
    id: 'badge_tree_challenge',
    title: 'Eco Guardian',
    category: 'challenges',
    categoryLabel: 'Challenge Completion',
    tier: 'Bronze',
    tierColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Planted 10+ trees in urban reforestation drive.',
    impactDetails: 'Directly contributed to offset carbon emissions and improve urban biodiversity.',
    icon: <TreePine className="h-6 w-6" />,
    iconBg: 'bg-emerald-500/10 border-emerald-300',
    iconColor: 'text-emerald-600',
    targetMetric: 1,
    metricType: 'challenges',
    unit: 'challenge',
    challengeId: 'c_tree',
    points: 150
  },
  {
    id: 'badge_3_challenges',
    title: 'Triple Threat',
    category: 'challenges',
    categoryLabel: 'Challenge Completion',
    tier: 'Platinum',
    tierColor: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'Successfully finished 3 distinct CSR challenges.',
    impactDetails: 'Demonstrated versatility across environmental, educational, and social care initiatives.',
    icon: <Flame className="h-6 w-6" />,
    iconBg: 'bg-pink-500/10 border-pink-300',
    iconColor: 'text-pink-600',
    targetMetric: 3,
    metricType: 'challenges',
    unit: 'challenges',
    points: 400
  },

  // Special Milestones
  {
    id: 'badge_philanthropist',
    title: 'Generous Heart',
    category: 'special',
    categoryLabel: 'Special Milestones',
    tier: 'Gold',
    tierColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Contributed ₹10,000+ in total donations.',
    impactDetails: 'Financial donations fund critical resources and infrastructure for partner NGOs.',
    icon: <Heart className="h-6 w-6" />,
    iconBg: 'bg-rose-500/10 border-rose-300',
    iconColor: 'text-rose-600',
    targetMetric: 10000,
    metricType: 'amount',
    unit: '₹',
    points: 300
  },
  {
    id: 'badge_multiplier',
    title: 'Matching Legend',
    category: 'special',
    categoryLabel: 'Special Milestones',
    tier: 'Platinum',
    tierColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Maxed out annual company donation match limit.',
    impactDetails: 'Unlocked 100% of corporate match matching capital for community grants.',
    icon: <Zap className="h-6 w-6" />,
    iconBg: 'bg-teal-500/10 border-teal-300',
    iconColor: 'text-teal-600',
    targetMetric: 10000,
    metricType: 'amount',
    unit: '₹',
    points: 500
  }
];

// Helper crown icon
function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.3 8.87l5.023-3.65a.5.5 0 0 1 .788.528l-2.01 10.05a2 2 0 0 1-1.96 1.602H6.859a2 2 0 0 1-1.96-1.602L2.888 5.748a.5.5 0 0 1 .788-.528l5.023 3.65z"/>
    </svg>
  );
}

export function EmployeeGamificationBadges() {
  const { totalHours, addHours } = useVolunteer();
  
  // Local state for completed challenges
  const [completedChallenges, setCompletedChallenges] = useState<string[]>(['c_river', 'c_tech']);
  const [userDonations] = useState<number>(10000); // from MyImpact default
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'hours' | 'challenges' | 'special' | 'earned' | 'locked'>('all');

  // Toggle challenge completion status for testing/gamification
  const toggleChallenge = (challengeId: string, challengeTitle: string) => {
    if (completedChallenges.includes(challengeId)) {
      setCompletedChallenges(prev => prev.filter(c => c !== challengeId));
      toast.info(`Marked "${challengeTitle}" as incomplete.`);
    } else {
      setCompletedChallenges(prev => [...prev, challengeId]);
      toast.success(`🎉 Challenge Completed: ${challengeTitle}!`, {
        description: 'New badge requirements updated!',
      });
    }
  };

  // Evaluate if a badge is earned
  const getBadgeProgress = (badge: BadgeDefinition) => {
    let current = 0;
    if (badge.metricType === 'hours') {
      current = totalHours;
    } else if (badge.metricType === 'challenges') {
      if (badge.id === 'badge_3_challenges') {
        current = completedChallenges.length;
      } else if (badge.challengeId) {
        current = completedChallenges.includes(badge.challengeId) ? 1 : 0;
      } else {
        current = completedChallenges.length;
      }
    } else if (badge.metricType === 'amount') {
      current = userDonations;
    }

    const isUnlocked = current >= badge.targetMetric;
    const percent = Math.min(100, Math.round((current / badge.targetMetric) * 100));

    return { current, target: badge.targetMetric, isUnlocked, percent };
  };

  // Calculate overall stats
  const badgeStats = BADGE_DEFINITIONS.map(badge => ({
    badge,
    ...getBadgeProgress(badge)
  }));

  const unlockedCount = badgeStats.filter(b => b.isUnlocked).length;
  const totalBadges = BADGE_DEFINITIONS.length;
  const totalEarnedPoints = badgeStats.filter(b => b.isUnlocked).reduce((acc, curr) => acc + curr.badge.points, 0);

  // User rank level calculation based on earned points
  const getRankLevel = (pts: number) => {
    if (pts >= 2500) return { title: 'Legendary Changemaker', level: 5, nextPts: 5000, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (pts >= 1200) return { title: 'Platinum Impact Leader', level: 4, nextPts: 2500, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (pts >= 600) return { title: 'Gold CSR Pioneer', level: 3, nextPts: 1200, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (pts >= 250) return { title: 'Silver Community Catalyst', level: 2, nextPts: 600, color: 'text-slate-600 bg-slate-100 border-slate-300' };
    return { title: 'Bronze Volunteer', level: 1, nextPts: 250, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  };

  const currentRank = getRankLevel(totalEarnedPoints);

  // Filtered badges list
  const filteredBadges = badgeStats.filter(item => {
    if (filterCategory === 'hours') return item.badge.category === 'hours';
    if (filterCategory === 'challenges') return item.badge.category === 'challenges';
    if (filterCategory === 'special') return item.badge.category === 'special';
    if (filterCategory === 'earned') return item.isUnlocked;
    if (filterCategory === 'locked') return !item.isUnlocked;
    return true;
  });

  const handleShareBadge = (badgeTitle: string) => {
    navigator.clipboard.writeText(`I just unlocked the "${badgeTitle}" badge on CSR Connect for my volunteering impact! 🚀`);
    toast.success('Achievement text copied to clipboard!', {
      description: 'Share it on LinkedIn or Slack to inspire your teammates.'
    });
  };

  return (
    <Card className="border border-indigo-100 shadow-md bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden">
      {/* Top Header Banner */}
      <CardHeader className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="h-48 w-48 text-white" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentRank.color}`}>
                Level {currentRank.level} • {currentRank.title}
              </span>
              <span className="text-xs text-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> {totalEarnedPoints} XP
              </span>
            </div>
            <CardTitle className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Award className="h-7 w-7 text-yellow-400" />
              Gamification & Achievement Badges
            </CardTitle>
            <CardDescription className="text-indigo-200 mt-1 max-w-xl">
              Earn milestone badges automatically as you log volunteering hours and complete CSR challenges.
            </CardDescription>
          </div>

          {/* Stat Counters */}
          <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 text-center min-w-[280px]">
            <div>
              <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">Badges Earned</p>
              <p className="text-xl font-bold text-white mt-0.5">{unlockedCount} / {totalBadges}</p>
            </div>
            <div className="border-x border-white/15 px-2">
              <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">Vol. Hours</p>
              <p className="text-xl font-bold text-yellow-300 mt-0.5">{totalHours}h</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">Challenges</p>
              <p className="text-xl font-bold text-emerald-300 mt-0.5">{completedChallenges.length}</p>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5">
          <div className="flex justify-between text-xs text-indigo-200">
            <span className="font-medium">Next Level Progress</span>
            <span className="font-semibold text-white">{totalEarnedPoints} / {currentRank.nextPts} XP</span>
          </div>
          <Progress 
            value={Math.min(100, (totalEarnedPoints / currentRank.nextPts) * 100)} 
            className="h-2 bg-indigo-950 [&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-emerald-400" 
          />
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Interactive Controls & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant={filterCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterCategory('all')}
              className="h-8 text-xs font-semibold"
            >
              All ({totalBadges})
            </Button>
            <Button
              variant={filterCategory === 'hours' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterCategory('hours')}
              className="h-8 text-xs font-semibold gap-1"
            >
              <Clock className="w-3.5 h-3.5" /> Hours
            </Button>
            <Button
              variant={filterCategory === 'challenges' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterCategory('challenges')}
              className="h-8 text-xs font-semibold gap-1"
            >
              <Target className="w-3.5 h-3.5" /> Challenges
            </Button>
            <Button
              variant={filterCategory === 'special' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterCategory('special')}
              className="h-8 text-xs font-semibold gap-1"
            >
              <Heart className="w-3.5 h-3.5" /> Special
            </Button>
            <Button
              variant={filterCategory === 'earned' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterCategory('earned')}
              className="h-8 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Earned ({unlockedCount})
            </Button>
            <Button
              variant={filterCategory === 'locked' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterCategory('locked')}
              className="h-8 text-xs font-semibold text-slate-500"
            >
              In Progress ({totalBadges - unlockedCount})
            </Button>
          </div>

          {/* Simulator Actions */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => addHours(2, 'Community Drive')}
              className="h-8 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> +2 Vol. Hours
            </Button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBadges.map(({ badge, current, target, isUnlocked, percent }) => (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 opacity-80'
              }`}
            >
              {/* Badge Header Row */}
              <div className="flex items-start justify-between gap-2">
                <div className={`p-3 rounded-xl border ${badge.iconBg} ${badge.iconColor} ${!isUnlocked && 'grayscale'}`}>
                  {badge.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`text-[10px] font-bold border ${badge.tierColor}`}>
                    {badge.tier}
                  </Badge>
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
              </div>

              {/* Badge Content */}
              <div className="mt-3 space-y-1">
                <h3 className={`font-bold text-sm tracking-tight ${isUnlocked ? 'text-slate-900 group-hover:text-indigo-600' : 'text-slate-700'}`}>
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {/* Progress Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-medium">Progress</span>
                  <span className={`font-bold ${isUnlocked ? 'text-emerald-600' : 'text-indigo-600'}`}>
                    {badge.metricType === 'amount' ? `₹${current.toLocaleString()}` : current} / {badge.metricType === 'amount' ? `₹${target.toLocaleString()}` : target} {badge.unit}
                  </span>
                </div>
                <Progress 
                  value={percent} 
                  className={`h-1.5 ${isUnlocked ? '[&>div]:bg-emerald-500' : '[&>div]:bg-indigo-500'}`} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Challenge Completion Quick Toggles Box */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              Interactive Challenge Tracker
            </h4>
            <span className="text-[11px] text-indigo-600 font-medium">Toggle challenge status to test badge updates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div 
              onClick={() => toggleChallenge('c_river', 'Clean Ganga Initiative')}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                completedChallenges.includes('c_river') 
                  ? 'bg-white border-blue-300 shadow-xs text-blue-900' 
                  : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-bold">Clean Ganga Initiative</p>
                  <p className="text-[10px] text-slate-500">River cleanup drive</p>
                </div>
              </div>
              {completedChallenges.includes('c_river') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </div>

            <div 
              onClick={() => toggleChallenge('c_tech', 'Digital Youth Workshop')}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                completedChallenges.includes('c_tech') 
                  ? 'bg-white border-purple-300 shadow-xs text-purple-900' 
                  : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-bold">Digital Youth Workshop</p>
                  <p className="text-[10px] text-slate-500">Teaching tech skills</p>
                </div>
              </div>
              {completedChallenges.includes('c_tech') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </div>

            <div 
              onClick={() => toggleChallenge('c_tree', 'Urban Tree Reforestation')}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                completedChallenges.includes('c_tree') 
                  ? 'bg-white border-emerald-300 shadow-xs text-emerald-900' 
                  : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold">Urban Tree Reforestation</p>
                  <p className="text-[10px] text-slate-500">Planting native trees</p>
                </div>
              </div>
              {completedChallenges.includes('c_tree') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Badge Detail Dialog Modal */}
      <Dialog open={!!selectedBadge} onOpenChange={(open) => !open && setSelectedBadge(null)}>
        {selectedBadge && (() => {
          const progress = getBadgeProgress(selectedBadge);
          return (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3.5 rounded-2xl border ${selectedBadge.iconBg} ${selectedBadge.iconColor}`}>
                    {selectedBadge.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] border ${selectedBadge.tierColor}`}>
                        {selectedBadge.tier} Tier
                      </Badge>
                      <span className="text-xs text-indigo-600 font-bold">+{selectedBadge.points} XP</span>
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-900 mt-1">
                      {selectedBadge.title}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</p>
                  <p className="text-sm text-slate-700 mt-0.5">{selectedBadge.description}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Impact Meaning
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {selectedBadge.impactDetails}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Requirement Progress</span>
                    <span className={progress.isUnlocked ? 'text-emerald-600' : 'text-indigo-600'}>
                      {selectedBadge.metricType === 'amount' ? `₹${progress.current.toLocaleString()}` : progress.current} / {selectedBadge.metricType === 'amount' ? `₹${progress.target.toLocaleString()}` : progress.target} {selectedBadge.unit} ({progress.percent}%)
                    </span>
                  </div>
                  <Progress value={progress.percent} className={`h-2 ${progress.isUnlocked ? '[&>div]:bg-emerald-500' : '[&>div]:bg-indigo-500'}`} />
                </div>

                {progress.isUnlocked ? (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    Congratulations! You have officially unlocked this badge.
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    Complete {selectedBadge.targetMetric - progress.current} more {selectedBadge.unit} to earn this badge.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                {progress.isUnlocked && (
                  <Button size="sm" onClick={() => handleShareBadge(selectedBadge.title)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Share Achievement
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedBadge(null)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </Card>
  );
}
