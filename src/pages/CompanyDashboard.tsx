import { EmptyState } from '@/src/components/EmptyState';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { 
  Users, IndianRupee, Target, Settings, Link as LinkIcon, ShieldCheck, 
  SlidersHorizontal, Eye, EyeOff, Bell, Trophy, Zap, Award, CheckCircle2, 
  AlertCircle, PlusCircle, RotateCcw, TrendingUp, Sparkles, Clock, Building2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserRoleInfo } from '@/src/lib/userRole';

import { CSREventsCalendar } from '@/src/components/CSREventsCalendar';
import { CompanyRecentActivityFeed } from '@/src/components/CompanyRecentActivityFeed';
import { DepartmentLeaderboard } from '@/src/components/DepartmentLeaderboard';
import { WeeklyEmailDigestGenerator } from '@/src/components/WeeklyEmailDigestGenerator';

export function CompanyDashboard() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSavingTarget, setIsSavingTarget] = useState<boolean>(false);

  const [widgets, setWidgets] = useState({
    participation: true,
    fundsMatched: true,
    volunteerHours: true,
    activeCampaigns: true,
  });

  // Annual Volunteer Target State (defaults to 1000 until loaded from Firestore)
  const [targetHours, setTargetHours] = useState<number>(10000);
  const [completedHours, setCompletedHours] = useState<number>(0);
  const [participationRate, setParticipationRate] = useState<number>(0);
  const [fundsMatched, setFundsMatched] = useState<number>(0);
  const [activeCampaignsCount, setActiveCampaignsCount] = useState<number>(0);
  const [pledgesCount, setPledgesCount] = useState<number>(0);
  const [nominatedProjects, setNominatedProjects] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);

  const [notifiedMilestones, setNotifiedMilestones] = useState<{ [key: number]: boolean }>({
    50: false,
    75: false,
    100: false,
  });

  const prevHoursRef = useRef<number>(completedHours);

  // Fetch real volunteer commitments and company metrics from Firestore
  useEffect(() => {
    const fetchCompanyDashboardMetrics = async () => {
      try {
        // 0. Fetch company settings for personalized targetHours
        let activeCompanyId: string | null = null;
        if (user) {
          const roleInfo = await getUserRoleInfo(user);
          if (roleInfo.company) {
            activeCompanyId = roleInfo.company.id;
            setCompanyId(roleInfo.company.id);
            if (roleInfo.company.targetHours && Number(roleInfo.company.targetHours) > 0) {
              setTargetHours(Number(roleInfo.company.targetHours));
            }
          }
        }

        if (activeCompanyId) {
          const compSnap = await getDoc(doc(db, 'companies', activeCompanyId));
          if (compSnap.exists() && compSnap.data()?.targetHours) {
            setTargetHours(Number(compSnap.data().targetHours));
          }
        } else {
          // Fallback if no logged-in corporate profile
          const companiesSnap = await getDocs(collection(db, 'companies'));
          if (!companiesSnap.empty) {
            const firstCompDoc = companiesSnap.docs[0];
            setCompanyId(firstCompDoc.id);
            if (firstCompDoc.data()?.targetHours) {
              setTargetHours(Number(firstCompDoc.data().targetHours));
            }
          }
        }

        // 1. Commitments (Volunteer Hours & Pledges)
        const commitmentsSnap = await getDocs(collection(db, 'commitments'));
        const totalHrs = commitmentsSnap.docs.reduce((sum, doc) => sum + (Number(doc.data().hoursPledged) || 0), 0);
        setCompletedHours(totalHrs);
        setPledgesCount(commitmentsSnap.docs.length);

        const volunteerUsers = new Set(
          commitmentsSnap.docs.map(doc => doc.data().userId || doc.data().userEmail).filter(Boolean)
        );

        // 2. Users (Workforce size)
        const usersSnap = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnap.docs.length;
        if (totalUsers > 0) {
          setParticipationRate(Math.min(100, Math.round((volunteerUsers.size / totalUsers) * 100)));
        } else {
          setParticipationRate(0);
        }

        // 3. Payments (Matched Funds)
        const paymentsSnap = await getDocs(collection(db, 'payments'));
        const matched = paymentsSnap.docs.reduce((sum, doc) => {
          const d = doc.data();
          return sum + (Number(d.matchedAmount) || Number(d.amount) || 0);
        }, 0);
        setFundsMatched(matched);

        // 4. Projects (Active Campaigns & Nominated Projects)
        const projectsSnap = await getDocs(collection(db, 'projects'));
        let activeCount = 0;
        const nominated: any[] = [];

        projectsSnap.docs.forEach(doc => {
          const p = doc.data();
          if (p.status === 'approved') {
            activeCount++;
          }
          if (p.nominatedBy || p.isNominated || p.status === 'pending_approval' || p.status === 'pending') {
            nominated.push({ id: doc.id, ...p });
          }
        });

        setActiveCampaignsCount(activeCount);
        setNominatedProjects(nominated);

        // Aggregate monthly engagement from payments/commitments if available
        if (paymentsSnap.docs.length > 0 || commitmentsSnap.docs.length > 0) {
          setEngagementData([
            { month: 'Current', participation: participationRate, hours: totalHrs }
          ]);
        } else {
          setEngagementData([]);
        }

      } catch (e) {
        console.error('Error fetching company dashboard metrics:', e);
      }
    };

    fetchCompanyDashboardMetrics();
  }, [user]);

  const handleSaveTargetHours = async (newVal: number) => {
    const val = Math.max(10, newVal);
    setTargetHours(val);
    let targetCompanyId = companyId;

    if (!targetCompanyId) {
      const companiesSnap = await getDocs(collection(db, 'companies'));
      if (!companiesSnap.empty) {
        targetCompanyId = companiesSnap.docs[0].id;
        setCompanyId(targetCompanyId);
      }
    }

    if (targetCompanyId) {
      setIsSavingTarget(true);
      try {
        await updateDoc(doc(db, 'companies', targetCompanyId), {
          targetHours: val
        });
        toast.success('Company target updated', {
          description: `Volunteer hour goal set to ${val.toLocaleString()} hrs in company settings.`
        });
      } catch (e) {
        console.error('Error saving target hours:', e);
        toast.error('Failed to save target hours to company settings');
      } finally {
        setIsSavingTarget(false);
      }
    }
  };

  // Milestone Toast Trigger logic on target progress changes (50%, 75%, 100%)
  useEffect(() => {
    if (!targetHours || targetHours <= 0) return;
    const currentPct = (completedHours / targetHours) * 100;
    const prevPct = (prevHoursRef.current / targetHours) * 100;

    // Check 100% Target Milestone
    if (currentPct >= 100 && (!notifiedMilestones[100] || (prevPct < 100 && currentPct >= 100))) {
      toast.success('🏆 100% Annual Target Achieved!', {
        description: `Extraordinary impact! Company surpassed the annual target with ${completedHours.toLocaleString()} / ${targetHours.toLocaleString()} volunteer hours (${currentPct.toFixed(1)}%)!`,
        duration: 8000,
        action: {
          label: 'Celebrate! 🎉',
          onClick: () => {},
        }
      });
      setNotifiedMilestones(prev => ({ ...prev, 100: true }));
    }
    // Check 75% Milestone
    else if (currentPct >= 75 && (!notifiedMilestones[75] || (prevPct < 75 && currentPct >= 75))) {
      toast.success('🚀 75% Milestone Reached!', {
        description: `Outstanding achievement! Company has reached ${completedHours.toLocaleString()} / ${targetHours.toLocaleString()} volunteer hours (${currentPct.toFixed(1)}%).`,
        duration: 6000,
        action: {
          label: 'View Impact Report',
          onClick: () => {},
        }
      });
      setNotifiedMilestones(prev => ({ ...prev, 75: true }));
    }
    // Check 50% Milestone
    else if (currentPct >= 50 && (!notifiedMilestones[50] || (prevPct < 50 && currentPct >= 50))) {
      toast.info('🎯 50% Milestone Reached!', {
        description: `Halfway mark crossed! Company completed ${completedHours.toLocaleString()} / ${targetHours.toLocaleString()} volunteer hours (${currentPct.toFixed(1)}%).`,
        duration: 6000,
        action: {
          label: 'Acknowledge',
          onClick: () => {},
        }
      });
      setNotifiedMilestones(prev => ({ ...prev, 50: true }));
    }

    prevHoursRef.current = completedHours;
  }, [completedHours, targetHours, notifiedMilestones]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('csrDashboardWidgets');
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        // use default
      }
    }
  }, []);

  const toggleWidget = (key: keyof typeof widgets) => {
    const next = { ...widgets, [key]: !widgets[key] };
    setWidgets(next);
    localStorage.setItem('csrDashboardWidgets', JSON.stringify(next));
  };

  const currentProgressPct = Math.min(100, (completedHours / targetHours) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Enterprise Overview
            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0">Admin Portal</Badge>
          </h1>
          <p className="text-gray-500">Track employee engagement, manage matching rules, and monitor volunteer target milestones.</p>
        </div>
        <div className="flex space-x-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Customize Widgets
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm leading-none mb-3">Dashboard Widgets</h4>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="w-participation" className="flex flex-col space-y-1">
                    <span>Employee Participation</span>
                  </Label>
                  <Switch 
                    id="w-participation" 
                    checked={widgets.participation}
                    onCheckedChange={() => toggleWidget('participation')}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="w-funds" className="flex flex-col space-y-1">
                    <span>Funds Matched</span>
                  </Label>
                  <Switch 
                    id="w-funds" 
                    checked={widgets.fundsMatched}
                    onCheckedChange={() => toggleWidget('fundsMatched')}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="w-hours" className="flex flex-col space-y-1">
                    <span>Total Volunteer Hours</span>
                  </Label>
                  <Switch 
                    id="w-hours" 
                    checked={widgets.volunteerHours}
                    onCheckedChange={() => toggleWidget('volunteerHours')}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="w-campaigns" className="flex flex-col space-y-1">
                    <span>Active Campaigns</span>
                  </Label>
                  <Switch 
                    id="w-campaigns" 
                    checked={widgets.activeCampaigns}
                    onCheckedChange={() => toggleWidget('activeCampaigns')}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <button 
            onClick={() => toast.success('Enterprise CSR Impact Report exported as PDF!')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-700 shadow-sm"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.participation && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employee Participation</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participationRate}%</div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                {participationRate > 0 ? 'Workforce active in CSR' : 'No active volunteers yet'}
              </p>
            </CardContent>
          </Card>
        )}
        {widgets.fundsMatched && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funds Matched</CardTitle>
              <IndianRupee className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{fundsMatched.toLocaleString('en-IN')}</div>
              <p className="text-xs text-gray-500 mt-1">
                {fundsMatched > 0 ? 'Total matched contributions' : 'No matched funds yet'}
              </p>
            </CardContent>
          </Card>
        )}
        {widgets.volunteerHours && (
          <Card className="hover:shadow-md transition-shadow border-indigo-200 bg-indigo-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-900">Total Volunteer Hours</CardTitle>
              <Target className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{completedHours.toLocaleString()} hrs</div>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                <span>Target: {targetHours.toLocaleString()}h</span>
                <span className="font-bold text-indigo-700">{currentProgressPct.toFixed(1)}%</span>
              </div>
              <Progress value={currentProgressPct} className="h-1.5 mt-2 bg-gray-200 [&>div]:bg-indigo-600" />
            </CardContent>
          </Card>
        )}
        {widgets.activeCampaigns && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCampaignsCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                {activeCampaignsCount > 0 ? 'Approved active projects' : 'No active campaigns'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Featured Annual Volunteer Goal & Toast Notification System Card */}
      <Card className="border-indigo-200 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 shadow-md overflow-hidden">
        <CardHeader className="border-b border-indigo-100/60 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-indigo-600 text-white border-0 flex items-center gap-1 font-semibold">
                  <Bell className="w-3.5 h-3.5" /> Admin Milestone Alert System
                </Badge>
                <span className="text-xs text-indigo-700 font-medium">Auto-Trigger Toast Notifications</span>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Annual Volunteer Hour Target & Milestone Tracker
              </CardTitle>
              <CardDescription className="text-xs text-gray-600">
                Automatic toast alerts are sent to company admins when reaching 50%, 75%, and 100% of the annual target.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white gap-1.5 text-xs text-slate-700">
                    <Settings className="w-3.5 h-3.5 text-slate-500" /> Adjust Target
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <h4 className="font-semibold text-sm mb-2 text-slate-900">Set Annual Goal (Hours)</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={targetHours} 
                        onChange={(e) => setTargetHours(parseInt(e.target.value) || 0)} 
                        className="h-8 text-sm"
                      />
                      <span className="text-xs text-slate-500">hrs</span>
                      <Button
                        size="sm"
                        disabled={isSavingTarget}
                        onClick={() => handleSaveTargetHours(targetHours)}
                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                      >
                        {isSavingTarget ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Target is saved to company settings and recalculates 50% ({Math.round(targetHours * 0.5).toLocaleString()}h), 75% ({Math.round(targetHours * 0.75).toLocaleString()}h), and 100% ({targetHours.toLocaleString()}h) alert thresholds.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Main Visual Progress Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Current Volunteer Progress</span>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                    {completedHours.toLocaleString()} <span className="text-lg font-normal text-slate-500">/ {targetHours.toLocaleString()} hrs</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">{currentProgressPct.toFixed(1)}%</span>
                  <p className="text-xs text-slate-500">Target Achieved</p>
                </div>
              </div>

              {/* Multi-Milestone Progress Bar */}
              <div className="relative pt-2 pb-6">
                <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700 shadow"
                    style={{ width: `${currentProgressPct}%` }}
                  />
                </div>

                {/* Milestone Marker Pins */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className={`h-8 w-0.5 ${currentProgressPct >= 50 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${currentProgressPct >= 50 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    50% ({Math.round(targetHours * 0.5).toLocaleString()}h)
                  </span>
                </div>

                <div className="absolute top-0 left-[75%] -translate-x-1/2 flex flex-col items-center">
                  <div className={`h-8 w-0.5 ${currentProgressPct >= 75 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${currentProgressPct >= 75 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    75% ({Math.round(targetHours * 0.75).toLocaleString()}h)
                  </span>
                </div>

                <div className="absolute top-0 left-[100%] -translate-x-full flex flex-col items-end">
                  <div className={`h-8 w-0.5 ${currentProgressPct >= 100 ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${currentProgressPct >= 100 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    100% ({targetHours.toLocaleString()}h)
                  </span>
                </div>
              </div>

              {/* Milestone Alert Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className={`p-3 rounded-lg border transition-all ${
                  currentProgressPct >= 50 
                    ? 'bg-blue-50/80 border-blue-200 text-blue-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> 50% Target
                    </span>
                    {currentProgressPct >= 50 ? (
                      <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0">Triggered ✅</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Pending ⏳</Badge>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{Math.round(targetHours * 0.5).toLocaleString()} Hours</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Triggers halfway milestone toast</p>
                </div>

                <div className={`p-3 rounded-lg border transition-all ${
                  currentProgressPct >= 75 
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> 75% Target
                    </span>
                    {currentProgressPct >= 75 ? (
                      <Badge className="bg-indigo-600 text-white text-[10px] px-1.5 py-0">Triggered ✅</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Pending ⏳</Badge>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{Math.round(targetHours * 0.75).toLocaleString()} Hours</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Triggers high impact milestone toast</p>
                </div>

                <div className={`p-3 rounded-lg border transition-all ${
                  currentProgressPct >= 100 
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" /> 100% Target
                    </span>
                    {currentProgressPct >= 100 ? (
                      <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">Achieved! 🎉</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Pending ⏳</Badge>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{targetHours.toLocaleString()} Hours</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Triggers goal completion celebration toast</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Recent Activity Feed */}
      <CompanyRecentActivityFeed />

      {/* Weekly Executive Email Digest Generator */}
      <WeeklyEmailDigestGenerator />

      {/* Department Leaderboard Ranking */}
      <DepartmentLeaderboard />

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="activity">⚡ Live Activity Feed</TabsTrigger>
          <TabsTrigger value="digest">📧 Weekly Admin Digest</TabsTrigger>
          <TabsTrigger value="leaderboard">🏆 Department Leaderboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Impact</TabsTrigger>
          <TabsTrigger value="events">Events Calendar</TabsTrigger>
          <TabsTrigger value="approvals">Nomination Approvals</TabsTrigger>
          <TabsTrigger value="integration">SSO & Integration</TabsTrigger>
          <TabsTrigger value="matching">Matching Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="digest" className="space-y-6">
          <WeeklyEmailDigestGenerator />
        </TabsContent>
        
        <TabsContent value="leaderboard" className="space-y-6">
          <DepartmentLeaderboard />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Executive Activity Stream Insights
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time tracking of employee engagement across new CSR project launches, volunteer sign-ups, and milestone achievements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Active CSR Drives</span>
                    <span className="text-xl font-black text-slate-900">{activeCampaignsCount} Active Projects</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[10px]">{activeCampaignsCount > 0 ? 'Live' : 'Inactive'}</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Employee Sign-Ups</span>
                    <span className="text-xl font-black text-slate-900">{pledgesCount} Volunteer Pledges</span>
                  </div>
                  <Badge className="bg-blue-600 text-white text-[10px]">{pledgesCount > 0 ? 'Active' : 'No Pledges'}</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Completed Hours</span>
                    <span className="text-xl font-black text-slate-900">{completedHours} Hrs Logged</span>
                  </div>
                  <Badge className="bg-purple-600 text-white text-[10px]">Total Hours</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Nominated Projects</CardTitle>
              <CardDescription>Review and approve projects nominated by employees before they are sent to the Platform Admin for final validation.</CardDescription>
            </CardHeader>
            <CardContent>
              {nominatedProjects.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No Pending Project Nominations"
                  description="Employees can nominate local non-profit partners or CSR initiatives for corporate sponsorship. Invite your team to submit projects."
                  actionLabel="Invite Your Team"
                  actionHref="/company-dashboard"
                />
              ) : (
                <div className="space-y-4">
                  {nominatedProjects.map((project) => (
                    <div key={project.id} className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.title || project.name || 'Nominated Drive'}</h3>
                        <p className="text-sm text-gray-500">Nominated by: {project.nominatedBy || 'Employee'}</p>
                        <p className="text-xs text-gray-400 mt-1">Status: {project.status || 'Pending Review'}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => toast.error('Nominated project rejected.')}
                        >
                          Reject
                        </Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => toast.success('Project approved and submitted to Portal Admin!')}
                        >
                          Approve & Send to Portal Admin
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Engagement Trend</CardTitle>
              <CardDescription>Percentage of workforce actively donating or volunteering</CardDescription>
            </CardHeader>
            <CardContent>
              {engagementData.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No Engagement Trends Recorded"
                  description="Monthly volunteer and donation trends will appear as employees actively engage with CSR initiatives. Start your first campaign to boost participation."
                  actionLabel="Start Your First Campaign"
                  actionHref="/admin"
                />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementData}>
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="participation" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <CSREventsCalendar />
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Single Sign-On (SSO)</CardTitle>
              <CardDescription>Configure SAML/OIDC for seamless employee access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-4">
                  <ShieldCheck className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="font-semibold">Enterprise Identity Provider</h3>
                    <p className="text-sm text-gray-500">Status: <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ready to Configure</Badge></p>
                  </div>
                </div>
                <button 
                  onClick={() => toast.info('Opening SAML configuration modal')}
                  className="text-sm font-medium text-gray-600 border px-3 py-1.5 rounded hover:bg-gray-100"
                >
                  Configure
                </button>
              </div>
              <div className="p-4 border rounded-lg border-dashed text-center">
                <LinkIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Add New Identity Provider</h3>
                <p className="text-xs text-gray-500 mt-1">Support for Okta, Azure AD, Google Workspace, and generic SAML 2.0</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Corporate Matching Settings</CardTitle>
              <CardDescription>Define how employee donations are matched by the company.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Global Match Ratio</p>
                    <p className="text-2xl font-bold mt-1">1:1</p>
                    <p className="text-xs text-gray-500 mt-1">Company matches 100% of employee donation</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Annual Limit per Employee</p>
                    <p className="text-2xl font-bold mt-1">₹50,000</p>
                    <p className="text-xs text-gray-500 mt-1">Resets Jan 1st</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Special Campaign Matching Rules</h4>
                  <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-gray-500">
                    <p className="text-xs">No active special campaign boost rules configured.</p>
                    <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => toast.info('Configure campaign boost rules')}>
                      + Add Special Match Rule
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
