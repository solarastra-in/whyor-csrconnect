import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, Clock, IndianRupee, Heart, MapPin, ArrowRight, Medal, Star, UserPlus, Zap, BellRing, WifiOff, Calendar, GripHorizontal } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useVolunteer, AVAILABLE_BADGES } from '@/src/contexts/VolunteerContext';
import { useNavigate } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockProjects } from './DiscoverProjects';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { get, set } from 'idb-keyval';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSRNewsFeed } from '@/src/components/CSRNewsFeed';

function SortableWidget({ id, children, className }: { id: string, children: React.ReactNode, className?: string, key?: React.Key }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${className || ''}`}>
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 right-2 p-1.5 bg-white/50 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
      >
        <GripHorizontal className="w-4 h-4 text-gray-500" />
      </div>
      {children}
    </div>
  );
}

const volunteerData = [
  { month: 'Jan', hours: 2 },
  { month: 'Feb', hours: 4 },
  { month: 'Mar', hours: 3 },
  { month: 'Apr', hours: 6 },
  { month: 'May', hours: 1.5 },
  { month: 'Jun', hours: 5 },
];

const activityFeed = [
  { id: 1, type: 'signup', user: 'Rahul V.', action: 'signed up for', target: 'Riverbank Cleanup', time: '10m ago', icon: <UserPlus className="h-4 w-4 text-blue-500" /> },
  { id: 2, type: 'milestone', user: 'Sneha P.', action: 'reached', target: 'Silver Volunteer Milestone (50h)', time: '2h ago', icon: <Star className="h-4 w-4 text-yellow-500" /> },
  { id: 3, type: 'challenge', user: 'Engineering Team', action: 'completed', target: 'Q2 Tech For Good Challenge', time: '1d ago', icon: <Trophy className="h-4 w-4 text-purple-500" /> },
  { id: 4, type: 'signup', user: 'Amit K.', action: 'pledged 10h to', target: 'Digital Literacy Drive', time: '1d ago', icon: <Heart className="h-4 w-4 text-red-500" /> },
  { id: 5, type: 'milestone', user: 'Priya S.', action: 'matched', target: '₹50,000 in total donations', time: '2d ago', icon: <Zap className="h-4 w-4 text-orange-500" /> }
];

import { PostProjectSurvey } from '@/src/components/PostProjectSurvey';
import { VolunteerGuide } from '@/src/components/VolunteerGuide';

import { GamifiedEngagement } from '@/src/components/GamifiedEngagement';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { totalHours, earnedBadges, userSkills, communityPoints } = useVolunteer();
  const navigate = useNavigate();

  const [suggestedProjects, setSuggestedProjects] = useState<typeof mockProjects>([]);
  const [pledgedProjectsList, setPledgedProjectsList] = useState<typeof mockProjects>([]);
  const [surveyProject, setSurveyProject] = useState<{id: number, name: string} | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to milestones broadcast
    const q = query(
      collection(db, 'milestones'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    let unsubscribe = () => {};

    if (!isOffline) {
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          // Cache the initial loaded data
          const milestonesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          set('cached_milestones', milestonesData).catch(console.error);
          return;
        }
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            // Don't show toast for our own milestones since VolunteerContext already handles that
            if (data.userId !== user.uid) {
              toast(
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BellRing className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Team Celebration!</h3>
                      <p className="text-gray-600 font-medium text-xs">
                        <span className="font-bold">{data.userName}</span> just reached the <span className="font-bold text-blue-600">{data.title}</span> ({data.threshold}h) milestone!
                      </p>
                    </div>
                  </div>
                </div>,
                { duration: 6000, position: 'top-right' }
              );
            }
          }
        });
        
        // Cache the updated list
        const milestonesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set('cached_milestones', milestonesData).catch(console.error);
      }, (error) => {
        console.error("Firestore Error:", error);
      });
    }

    return () => unsubscribe();
  }, [user, isOffline]);

  useEffect(() => {
    // Get past activity
    const loadData = async () => {
      const saved = JSON.parse(localStorage.getItem('savedProjects') || '[]');
      const pledged = JSON.parse(localStorage.getItem('pledgedProjects') || '[]');
      
      let candidates = mockProjects.filter(p => !pledged.includes(p.id));
      
      const activeProjectTags = new Set<string>();
      mockProjects.forEach(p => {
        if (saved.includes(p.id) || pledged.includes(p.id)) {
          p.tags.forEach(t => activeProjectTags.add(t));
        }
      });
      
      candidates.sort((a, b) => {
        const aSkillMatch = a.volunteerRoles.some(r => r.skills?.some(s => userSkills.includes(s))) ? 1 : 0;
        const bSkillMatch = b.volunteerRoles.some(r => r.skills?.some(s => userSkills.includes(s))) ? 1 : 0;
        
        const aTagMatch = a.tags.filter(t => activeProjectTags.has(t)).length;
        const bTagMatch = b.tags.filter(t => activeProjectTags.has(t)).length;
        
        const scoreA = (aSkillMatch * 5) + aTagMatch;
        const scoreB = (bSkillMatch * 5) + bTagMatch;
        
        return scoreB - scoreA;
      });

      const newSuggested = candidates.slice(0, 2);
      const activePledged = mockProjects.filter(p => pledged.includes(p.id));
      
      setSuggestedProjects(newSuggested);
      setPledgedProjectsList(activePledged);
      
      // Cache this layout view using IndexedDB
      try {
        await set('dashboard_state', { suggestedProjects: newSuggested, pledgedProjectsList: activePledged });
      } catch (err) {
        console.error('Error caching dashboard state', err);
      }
    };
    
    // In a real app we might load from cache first then update
    loadData();
  }, [userSkills]);

  const handleCompleteProject = (id: number, name: string) => {
    setSurveyProject({ id, name });
  };

  const handleSurveyComplete = () => {
    if (surveyProject) {
      // Remove from pledged locally to simulate completion
      setPledgedProjectsList(prev => prev.filter(p => p.id !== surveyProject.id));
      const pledged = JSON.parse(localStorage.getItem('pledgedProjects') || '[]');
      const updatedPledged = pledged.filter((id: number) => id !== surveyProject.id);
      localStorage.setItem('pledgedProjects', JSON.stringify(updatedPledged));
      setSurveyProject(null);
    }
  };

  const [widgetOrder, setWidgetOrder] = useState<string[]>([
    'stats', 'missions', 'gamification', 'hours', 'leaderboard', 'pledged', 'badges', 'suggested', 'activity', 'news'
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-8">
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold text-sm">You are viewing in Offline Mode</p>
              <p className="text-xs">Your dashboard data is cached and will update when you reconnect.</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome & Quick Impact Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'Employee'}! 👋</h1>
          <p className="text-gray-500 mt-1">Ready to make an impact today? You have ₹15,000 left in your matching limit.</p>
        </div>
        
        <div className="flex flex-wrap gap-6 items-center w-full xl:w-auto bg-gray-50/50 p-4 rounded-lg border border-gray-100">
          <div className="flex flex-col min-w-[120px]">
             <span className="text-sm font-medium text-gray-500">My Hours</span>
             <span className="text-xl font-bold text-gray-900">{totalHours} <span className="text-sm font-normal text-gray-500">/ 50h Goal</span></span>
             <Progress value={Math.min((totalHours/50)*100, 100)} className="h-1.5 mt-2 bg-gray-200 [&>div]:bg-green-500" />
          </div>
          
          <div className="w-px h-12 bg-gray-200 hidden sm:block"></div>
          
          <div className="flex flex-col min-w-[120px]">
             <span className="text-sm font-medium text-gray-500">My Donations</span>
             <span className="text-xl font-bold text-gray-900">₹24,500 <span className="text-sm font-normal text-gray-500">/ ₹50K</span></span>
             <Progress value={(24500/50000)*100} className="h-1.5 mt-2 bg-gray-200 [&>div]:bg-blue-500" />
          </div>

          <div className="w-px h-12 bg-gray-200 hidden sm:block"></div>

          <div className="flex flex-col min-w-[140px]">
            <span className="text-sm font-medium text-gray-500">Next Event</span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="p-1.5 bg-purple-100 rounded-md">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">Riverbank Cleanup</p>
                <p className="text-xs text-gray-500 font-medium">Tomorrow, 9:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {widgetOrder.map(id => {
              let content = null;
              let className = 'col-span-1';
              
              if (id === 'stats') {
                className = 'col-span-1 md:col-span-2 lg:col-span-3';
                content = (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">My Total Donations</p>
                <div className="text-2xl font-bold mt-1">₹24,500</div>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">+ ₹24,500 matched by Company</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Volunteer Hours</p>
                <div className="text-2xl font-bold mt-1">{totalHours} hrs</div>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-4 font-medium flex items-center">
              <Trophy className="h-3 w-3 mr-1" /> Top 10% in Engineering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Community Points</p>
                <div className="text-2xl font-bold mt-1">{communityPoints}</div>
              </div>
              <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-amber-500 fill-current" />
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-4 font-medium flex items-center">
              Top 5% in the company
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/employee/challenges')}
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-white/80">Active Challenge</p>
                <p className="font-bold text-lg mt-1 leading-tight">Q3 Tech For Good</p>
              </div>
              <Trophy className="h-6 w-6 text-yellow-300" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-white/90">
                <span>Team Progress</span>
                <span>85 / 100 hrs</span>
              </div>
              <Progress value={85} className="h-1.5 bg-white/20 [&>div]:bg-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      
                );
              } else if (id === 'missions') {
                className = 'col-span-1 md:col-span-2 lg:col-span-3';
                content = (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900">Missions & Micro-actions</h2>
                      <p className="text-sm text-gray-500 cursor-pointer hover:text-blue-600">View All Missions</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-none hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-green-600">Sustainability</Badge>
                            <span className="text-xs font-bold text-green-700">+50 Pts</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">Meatless Monday</h3>
                          <p className="text-sm text-gray-600 mb-4">Commit to a vegetarian diet for one day to reduce carbon footprint.</p>
                          <Button variant="outline" className="w-full bg-white border-green-600 text-green-700 hover:bg-green-600 hover:text-white">Take Action</Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-none hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-blue-600">Wellness</Badge>
                            <span className="text-xs font-bold text-blue-700">+25 Pts</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">Mindful Minutes</h3>
                          <p className="text-sm text-gray-600 mb-4">Take 15 minutes away from your screen to meditate or stretch.</p>
                          <Button variant="outline" className="w-full bg-white border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white">Take Action</Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-none hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-amber-600">Learning</Badge>
                            <span className="text-xs font-bold text-amber-700">+100 Pts</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">Accessibility 101</h3>
                          <p className="text-sm text-gray-600 mb-4">Complete the 10-minute module on creating accessible content.</p>
                          <Button variant="outline" className="w-full bg-white border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white">Take Action</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              } else if (id === 'gamification') {
                className = 'col-span-1 md:col-span-2 lg:col-span-3';
                content = <GamifiedEngagement />;
              } else if (id === 'hours') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = (
                  <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Volunteer Hours (Last 6 Months)</h2>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volunteerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="hours" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          
                );
              } else if (id === 'pledged') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = (
                  <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Active Pledged Projects</h2>
                <p className="text-sm text-gray-500">Projects you've committed volunteer hours to</p>
              </div>
            </div>
            
            {pledgedProjectsList.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {pledgedProjectsList.map((project) => (
                  <Card key={project.id} className="border-blue-100 bg-blue-50/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{project.name}</h3>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 ml-2 shrink-0">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-1">{project.charityName}</p>
                      <button 
                        onClick={() => handleCompleteProject(project.id, project.name)} 
                        className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Mark as Completed
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-500 text-sm">You haven't pledged to any projects yet.</p>
                <button onClick={() => navigate('/employee/projects')} className="mt-2 text-sm text-blue-600 font-medium">Find a Project</button>
              </div>
            )}
          </div>

          
                );
              } else if (id === 'suggested') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = (
                  <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Suggested for You</h2>
                <p className="text-sm text-gray-500">Based on your skills and past projects</p>
              </div>
              <button onClick={() => navigate('/employee/projects')} className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</button>
            </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {suggestedProjects.length > 0 ? (
              suggestedProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gray-200 rounded-t-lg relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-blue-700 shadow-sm flex items-center">
                        <Heart className="h-3 w-3 mr-1 fill-blue-700" /> {project.match}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-bold leading-tight line-clamp-1">{project.name}</h3>
                        <p className="text-xs text-white/80 line-clamp-1">{project.charityName}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex gap-1 mb-3 flex-wrap">
                        {project.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] bg-gray-100">{tag}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center mb-4">
                        <MapPin className="h-3 w-3 mr-1" /> {project.location}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => navigate('/employee/projects')} className="flex-1 bg-blue-600 text-white py-1.5 rounded-md text-sm font-medium hover:bg-blue-700">View Details</button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-500 text-sm">Add more skills to your profile to get personalized suggestions.</p>
                <button onClick={() => navigate('/employee/projects')} className="mt-2 text-sm text-blue-600 font-medium">Browse All Projects</button>
              </div>
            )}
          </div>
          </div>
                );
              } else if (id === 'leaderboard') {
                className = 'col-span-1';
                content = (
                  <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Company Leaderboard</h2>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Top Contributors</span>
                <Medal className="h-4 w-4 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hours" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="hours">Hours</TabsTrigger>
                  <TabsTrigger value="donations">Donations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="hours">
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: 'Sarah J.', dept: 'Engineering', value: '45h' },
                      { rank: 2, name: 'Mike T.', dept: 'Sales', value: '38h' },
                      { rank: 3, name: 'Engineering Team', dept: 'Team', value: '420h' },
                      { rank: 4, name: 'Priya K.', dept: 'Marketing', value: '25h' },
                      { rank: 14, name: 'You', dept: 'Engineering', value: '16.5h', isUser: true },
                    ].map((row) => (
                      <div key={row.rank} className={`flex items-center justify-between p-2 rounded-lg ${row.isUser ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center">
                          <span className={`w-6 text-center text-xs font-bold ${row.rank === 1 ? 'text-yellow-500' : row.rank === 2 ? 'text-gray-400' : row.rank === 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                            #{row.rank}
                          </span>
                          <div className="ml-2">
                            <p className={`text-sm font-medium ${row.isUser ? 'text-blue-900' : 'text-gray-700'}`}>{row.name}</p>
                            <p className="text-xs text-gray-500">{row.dept}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${row.isUser ? 'text-blue-900' : 'text-gray-900'}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="donations">
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: 'Leadership Team', dept: 'Team', value: '₹5L' },
                      { rank: 2, name: 'David W.', dept: 'Product', value: '₹1.2L' },
                      { rank: 3, name: 'Anita B.', dept: 'Sales', value: '₹85K' },
                      { rank: 4, name: 'Sales Team', dept: 'Team', value: '₹3.4L' },
                      { rank: 12, name: 'You', dept: 'Engineering', value: '₹24.5K', isUser: true },
                    ].map((row, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${row.isUser ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center">
                          <span className={`w-6 text-center text-xs font-bold ${row.rank === 1 ? 'text-yellow-500' : row.rank === 2 ? 'text-gray-400' : row.rank === 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                            #{row.rank}
                          </span>
                          <div className="ml-2">
                            <p className={`text-sm font-medium ${row.isUser ? 'text-blue-900' : 'text-gray-700'}`}>{row.name}</p>
                            <p className="text-xs text-gray-500">{row.dept}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${row.isUser ? 'text-blue-900' : 'text-gray-900'}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              
              <button onClick={() => navigate('/employee/challenges')} className="w-full mt-4 text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center">
                View full rankings <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </CardContent>
          </Card>
          </div>
                );
              } else if (id === 'badges') {
                className = 'col-span-1';
                content = (
                  <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">My Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {earnedBadges.map(badgeId => {
                  const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
                  if (!badge) return null;
                  return (
                    <div key={badge.id} className="relative group cursor-help">
                      <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                        {badge.icon}
                      </div>
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-50 bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 pointer-events-none w-32 text-center">
                        <p className="font-bold">{badge.title}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">{badge.description}</p>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          
                );
              } else if (id === 'activity') {
                className = 'col-span-1';
                content = (
                  <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityFeed.map((activity, idx) => (
                  <div key={activity.id} className="relative flex gap-3">
                    {/* Timeline line */}
                    {idx !== activityFeed.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-gray-100" />
                    )}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 ring-2 ring-white">
                      {activity.icon}
                    </div>
                    <div className="flex flex-col pt-1.5">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
                        <span className="font-semibold text-blue-900">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
                );
              } else if (id === 'news') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = <CSRNewsFeed isAdmin={true} />;
              }
              
              return (
                <SortableWidget key={id} id={id} className={className}>
                  {content}
                </SortableWidget>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      <PostProjectSurvey 
        open={surveyProject !== null}
        onOpenChange={(open) => !open && setSurveyProject(null)}
        projectId={surveyProject?.id || 0}
        projectName={surveyProject?.name || ''}
        onComplete={handleSurveyComplete}
      />
      <VolunteerGuide />
    </div>
  );
}
