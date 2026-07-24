import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Trophy, Medal, Flame, TrendingUp, Users, Clock, IndianRupee, 
  Sparkles, Award, ArrowUpRight, ChevronRight, Target, ShieldCheck,
  Building2, Crown, Zap, HeartHandshake
} from 'lucide-react';
import { toast } from 'sonner';

export interface DepartmentMetric {
  id: string;
  rank: number;
  name: string;
  headCount: number;
  activeVolunteers: number;
  totalHours: number;
  totalDonations: number;
  participationRate: number; // percentage
  topProject: string;
  departmentLead: string;
  monthlyGrowth: string; // e.g., '+18%'
  badge: string;
}

const INITIAL_DEPARTMENTS: DepartmentMetric[] = [
  {
    id: 'dept-1',
    rank: 1,
    name: 'Software Engineering & Tech',
    headCount: 240,
    activeVolunteers: 204,
    totalHours: 1420,
    totalDonations: 185000,
    participationRate: 85,
    topProject: 'Tech Skills Workshop for Youth',
    departmentLead: 'Sarah Jenkins',
    monthlyGrowth: '+24%',
    badge: '🏆 CSR Champion Tech Lead',
  },
  {
    id: 'dept-2',
    rank: 2,
    name: 'Product & User Experience',
    headCount: 95,
    activeVolunteers: 78,
    totalHours: 890,
    totalDonations: 120000,
    participationRate: 82,
    topProject: 'Senior Citizen Digital Literacy',
    departmentLead: 'Rohan Mehta',
    monthlyGrowth: '+18%',
    badge: '🥈 Innovation Innovator',
  },
  {
    id: 'dept-3',
    rank: 3,
    name: 'Operations & Logistics',
    headCount: 180,
    activeVolunteers: 135,
    totalHours: 810,
    totalDonations: 95000,
    participationRate: 75,
    topProject: 'Urban Riverbank Cleanliness Drive',
    departmentLead: 'Emily Taylor',
    monthlyGrowth: '+15%',
    badge: '🥉 Grassroots Force',
  },
  {
    id: 'dept-4',
    rank: 4,
    name: 'Sales & Business Growth',
    headCount: 210,
    activeVolunteers: 142,
    totalHours: 680,
    totalDonations: 210000,
    participationRate: 68,
    topProject: 'Community Greenery Drive',
    departmentLead: 'Vikram Malhotra',
    monthlyGrowth: '+30%',
    badge: '⚡ Top Fundraising Team',
  },
  {
    id: 'dept-5',
    rank: 5,
    name: 'Human Resources & Workplace',
    headCount: 60,
    activeVolunteers: 51,
    totalHours: 540,
    totalDonations: 65000,
    participationRate: 85,
    topProject: 'Blood Donation & Relief Camp',
    departmentLead: 'Priya Patel',
    monthlyGrowth: '+12%',
    badge: '🌟 Highest Participation Rate',
  },
  {
    id: 'dept-6',
    rank: 6,
    name: 'Finance, Legal & Compliance',
    headCount: 85,
    activeVolunteers: 48,
    totalHours: 390,
    totalDonations: 80000,
    participationRate: 56,
    topProject: 'Disaster Relief Food Distribution',
    departmentLead: 'Amitabh Sen',
    monthlyGrowth: '+8%',
    badge: '🎯 Rising CSR Star',
  },
];

export function DepartmentLeaderboard() {
  const [departments, setDepartments] = useState<DepartmentMetric[]>(INITIAL_DEPARTMENTS);
  const [sortBy, setSortBy] = useState<'totalHours' | 'totalDonations' | 'participationRate'>('totalHours');
  const [selectedDept, setSelectedDept] = useState<DepartmentMetric | null>(null);

  // Re-sort department ranking based on chosen metric
  const sortedDepartments = [...departments].sort((a, b) => {
    return b[sortBy] - a[sortBy];
  }).map((dept, index) => ({
    ...dept,
    rank: index + 1
  }));

  const totalCompanyHours = departments.reduce((acc, d) => acc + d.totalHours, 0);
  const totalCompanyDonations = departments.reduce((acc, d) => acc + d.totalDonations, 0);
  const avgParticipation = Math.round(departments.reduce((acc, d) => acc + d.participationRate, 0) / departments.length);

  return (
    <Card className="border border-indigo-100 shadow-md bg-white overflow-hidden my-6">
      {/* Leaderboard Header Banner */}
      <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative overflow-hidden border-b border-indigo-900">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="h-56 w-56 text-amber-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 font-extrabold px-2.5 py-0.5 text-xs flex items-center gap-1 border-0">
                <Crown className="w-3.5 h-3.5 fill-slate-950" /> Internal Competition
              </Badge>
              <span className="text-xs text-indigo-200 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Real-time Department Rankings
              </span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Department CSR Leaderboard
            </CardTitle>
            <CardDescription className="text-indigo-200 text-xs sm:text-sm">
              Rank corporate teams by volunteer hours logged, funds raised, and employee participation rates to drive team engagement.
            </CardDescription>
          </div>

          {/* Quick Ranking Metric Picker */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider block">Rank By Metric</span>
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="bg-white text-slate-950 font-bold text-xs h-9 w-[180px] border-0 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalHours">⏱️ Total Volunteer Hours</SelectItem>
                  <SelectItem value="totalDonations">₹ Funds Matched / Donated</SelectItem>
                  <SelectItem value="participationRate">📊 Participation Rate (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Company Summary Snapshot Pill */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/10">
            <div className="h-8 w-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-medium block">Total Corporate Hours</span>
              <strong className="text-sm font-bold text-white">{totalCompanyHours.toLocaleString()} Volunteer Hrs</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/10">
            <div className="h-8 w-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-medium block">Matched Contributions</span>
              <strong className="text-sm font-bold text-white">₹{totalCompanyDonations.toLocaleString()} Raised</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/10">
            <div className="h-8 w-8 rounded-lg bg-purple-400/20 text-purple-300 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-medium block">Avg Department Participation</span>
              <strong className="text-sm font-bold text-white">{avgParticipation}% Active Workforce</strong>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Leaderboard Table / Card List */}
      <CardContent className="p-6 space-y-4">
        {/* Top 3 Podium Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          {sortedDepartments.slice(0, 3).map((dept, index) => {
            const podiumStyles = [
              {
                border: 'border-amber-300 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30',
                badgeBg: 'bg-amber-400 text-slate-950',
                rankIcon: <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />,
                rankText: '#1 Champion',
              },
              {
                border: 'border-slate-300 bg-gradient-to-b from-slate-100/70 via-white to-slate-50/30',
                badgeBg: 'bg-slate-300 text-slate-900',
                rankIcon: <Medal className="w-5 h-5 text-slate-500" />,
                rankText: '#2 Runner-Up',
              },
              {
                border: 'border-amber-700/30 bg-gradient-to-b from-amber-100/40 via-white to-amber-50/20',
                badgeBg: 'bg-amber-700 text-white',
                rankIcon: <Medal className="w-5 h-5 text-amber-700" />,
                rankText: '#3 3rd Place',
              }
            ][index];

            return (
              <div 
                key={dept.id} 
                onClick={() => setSelectedDept(dept)}
                className={`p-4 rounded-2xl border-2 ${podiumStyles.border} hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group`}
              >
                <div className="flex items-start justify-between">
                  <Badge className={`${podiumStyles.badgeBg} font-extrabold text-xs px-2.5 py-0.5 border-0 flex items-center gap-1`}>
                    {podiumStyles.rankIcon} {podiumStyles.rankText}
                  </Badge>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {dept.monthlyGrowth}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-extrabold text-base text-gray-900 group-hover:text-indigo-900 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Lead: <strong className="text-gray-700">{dept.departmentLead}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium uppercase block">Volunteer Hours</span>
                    <strong className="text-base font-black text-indigo-900">{dept.totalHours} hrs</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium uppercase block">Donations Matched</span>
                    <strong className="text-base font-black text-emerald-700">₹{(dept.totalDonations / 1000).toFixed(0)}k</strong>
                  </div>
                </div>

                {/* Progress Bar for Participation */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-gray-600">
                    <span>Participation ({dept.activeVolunteers}/{dept.headCount})</span>
                    <span className="text-indigo-700 font-bold">{dept.participationRate}%</span>
                  </div>
                  <Progress value={dept.participationRate} className="h-1.5 [&>div]:bg-indigo-600" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Department Leaderboard List */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" /> Full Team Ranking ({departments.length} Departments)
            </h4>
            <span className="text-xs text-gray-400">Click department row for detailed team breakdown</span>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
            {sortedDepartments.map((dept) => (
              <div 
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className="p-3.5 sm:p-4 hover:bg-indigo-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                {/* Left Rank & Department Info */}
                <div className="flex items-center gap-3.5">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                    dept.rank === 1 ? 'bg-amber-400 text-slate-950 font-black' :
                    dept.rank === 2 ? 'bg-slate-200 text-slate-800' :
                    dept.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{dept.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-900 transition-colors">
                        {dept.name}
                      </h4>
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 font-medium">
                        {dept.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Top Project: <span className="text-indigo-700 font-medium">{dept.topProject}</span>
                    </p>
                  </div>
                </div>

                {/* Right Metrics Grid */}
                <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium block uppercase">Hours</span>
                    <strong className="text-sm font-extrabold text-indigo-900">{dept.totalHours} hrs</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-medium block uppercase">Raised</span>
                    <strong className="text-sm font-extrabold text-emerald-700">₹{(dept.totalDonations / 1000).toFixed(0)}k</strong>
                  </div>

                  <div className="hidden md:block w-28">
                    <span className="text-[10px] text-gray-400 font-medium block uppercase">Participation</span>
                    <strong className="text-sm font-bold text-gray-800">{dept.participationRate}%</strong>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Department Detail Modal Dialog */}
      <Dialog open={!!selectedDept} onOpenChange={() => setSelectedDept(null)}>
        {selectedDept && (
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
              <Badge className="bg-amber-400 text-slate-950 font-bold text-xs uppercase mb-1 border-0">
                Rank #{selectedDept.rank} Department
              </Badge>
              <DialogTitle className="text-xl font-extrabold text-white mt-1">
                {selectedDept.name}
              </DialogTitle>
              <DialogDescription className="text-indigo-200 text-xs mt-0.5">
                Department Lead: {selectedDept.departmentLead}
              </DialogDescription>
            </div>

            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] text-indigo-600 font-bold uppercase block">Total Volunteer Hours</span>
                  <strong className="text-xl font-black text-indigo-900">{selectedDept.totalHours} Hrs</strong>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">Donations Matched</span>
                  <strong className="text-xl font-black text-emerald-900">₹{selectedDept.totalDonations.toLocaleString()}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Workforce Active:</span>
                  <strong className="font-bold">{selectedDept.activeVolunteers} / {selectedDept.headCount} Employees</strong>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>Participation Rate:</span>
                  <strong className="font-bold text-indigo-700">{selectedDept.participationRate}%</strong>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>Monthly Hours Growth:</span>
                  <strong className="font-bold text-emerald-600">{selectedDept.monthlyGrowth} 🚀</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Top Department Project</span>
                <p className="text-xs font-extrabold text-slate-900 mt-0.5">{selectedDept.topProject}</p>
              </div>

              <Button 
                onClick={() => {
                  toast.success(`Recognition badge sent to ${selectedDept.name} team!`);
                  setSelectedDept(null);
                }} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Send Team Kudos & Badge
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}
