import { useState, useEffect, useMemo } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/src/contexts/AuthContext';
import { useVolunteer } from '@/src/contexts/VolunteerContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Target, CheckCircle2, ChevronRight, Leaf, BookOpen, HeartPulse, Users, Filter, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const initialChallenges = [
  {
    id: 1,
    title: 'Earth Month Challenge',
    category: 'Environment',
    description: 'Log 10 hours of environmental volunteering. Join local community gardens or cleanups to contribute to a greener planet.',
    progress: 8,
    goal: 10,
    unit: 'hours',
    team: 'Global Initiative',
    daysLeft: 12,
    active: true,
    rewardIcon: 'leaf',
    rewardColor: 'text-green-500 bg-green-50'
  },
  {
    id: 2,
    title: 'Summer Reading Tutors',
    category: 'Education',
    description: 'Help 5 students complete their summer reading goals. First team to 50 participants wins the company-wide recognition badge.',
    progress: 3,
    goal: 5,
    unit: 'students',
    team: 'Company-wide',
    daysLeft: 5,
    active: true,
    rewardIcon: 'book',
    rewardColor: 'text-blue-500 bg-blue-50'
  },
  {
    id: 3,
    title: 'Health & Wellness Drive',
    category: 'Health',
    description: 'Participate in 3 health camps or blood donation drives. Earn the Community Health Champion badge.',
    progress: 1,
    goal: 3,
    unit: 'events',
    team: 'Local Office',
    daysLeft: 20,
    active: true,
    rewardIcon: 'heart',
    rewardColor: 'text-rose-500 bg-rose-50'
  },
  {
    id: 4,
    title: 'Neighborhood Cleanup',
    category: 'Community',
    description: 'Organize or join 2 neighborhood cleanups in your area. Connect with your community.',
    progress: 2,
    goal: 2,
    unit: 'cleanups',
    team: 'Remote Team',
    daysLeft: 0,
    active: false,
    rewardIcon: 'users',
    rewardColor: 'text-indigo-500 bg-indigo-50'
  }
];

export function Challenges() {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [logValue, setLogValue] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const { totalHours } = useVolunteer();
  const { user: currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('totalHours', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snapshot) => {
      const topUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Anonymous',
        hours: doc.data().totalHours || 0
      }));
      
      if (topUsers.length === 0) {
        setLeaderboard([
          { id: '1', name: 'Alice Walker', hours: 45 },
          { id: '2', name: 'Bob Smith', hours: 38 },
          { id: '3', name: 'Charlie Davis', hours: 25 },
        ]);
      } else {
        setLeaderboard(topUsers);
      }
    }, (error) => console.error(error));
    return () => unsub();
  }, []);

  const handleLogActivity = () => {
    if (!selectedChallenge) return;
    
    const value = parseInt(logValue);
    if (isNaN(value) || value <= 0) return;
    
    setChallenges(prev => prev.map(c => 
      c.id === selectedChallenge.id ? { ...c, progress: Math.min(c.goal, c.progress + value) } : c
    ));
    setLogValue('');
    setSelectedChallenge(null);
    toast.success('Activity logged successfully! Keep up the good work.');
  };

  const categories = ['All', 'Environment', 'Education', 'Health', 'Community'];
  
  const filteredChallenges = useMemo(() => {
    if (filterCategory === 'All') return challenges;
    return challenges.filter(c => c.category === filterCategory);
  }, [challenges, filterCategory]);

  const getRewardIcon = (iconName: string, colorClass: string) => {
    const IconComponent = 
      iconName === 'leaf' ? Leaf : 
      iconName === 'book' ? BookOpen :
      iconName === 'heart' ? HeartPulse :
      iconName === 'users' ? Users : Award;
      
    return (
      <div className={`p-3 rounded-full ${colorClass} flex items-center justify-center shadow-inner`}>
        <IconComponent className="w-6 h-6" />
      </div>
    );
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Challenges & Rewards</h1>
          <p className="text-gray-500 mt-2 text-lg max-w-2xl">Join team challenges, earn achievement badges, and see how you rank among your peers on the leaderboard.</p>
        </div>
      </div>
      
      {/* Achievements Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-600" />
          Your Trophy Case
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-6 border-transparent hover:border-yellow-200 hover:shadow-lg transition-all bg-white/60 backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-sm border border-yellow-200">
              <Medal className="h-8 w-8 text-yellow-600" />
            </div>
            <h4 className="font-bold text-gray-900">Top Fundraiser</h4>
            <p className="text-xs text-gray-500 mt-2 font-semibold uppercase tracking-wider">July 2024</p>
          </Card>
          <Card className="text-center p-6 border-transparent hover:border-blue-200 hover:shadow-lg transition-all bg-white/60 backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-200">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900">10h Volunteer</h4>
            <p className="text-xs text-gray-500 mt-2 font-semibold uppercase tracking-wider">Milestone</p>
          </Card>
          <Card className="text-center p-6 md:col-span-2 bg-gradient-to-br from-amber-500 to-orange-500 border-none shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Trophy className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-left">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 flex-shrink-0">
                <Trophy className="h-10 w-10 text-white drop-shadow-md" />
              </div>
              <div>
                <h4 className="font-bold text-2xl text-white drop-shadow-sm">Rising Star</h4>
                <p className="text-orange-50 text-base mt-1 font-medium">You completed your first company match!</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Challenges Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Active Challenges</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              {categories.map(cat => (
                <Badge 
                  key={cat}
                  variant={filterCategory === cat ? 'default' : 'outline'}
                  className={`cursor-pointer whitespace-nowrap px-4 py-1.5 text-sm ${
                    filterCategory === cat 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'hover:bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredChallenges.map((challenge) => {
              const isCompleted = challenge.progress >= challenge.goal;
              return (
              <Card key={challenge.id} className={`overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col ${
                isCompleted 
                  ? 'border-2 border-green-500 bg-green-50/10' 
                  : 'border border-gray-200 hover:border-indigo-300'
              }`}>
                <CardHeader className="pb-4 relative">
                  <div className="absolute top-4 right-4">
                    {getRewardIcon(challenge.rewardIcon, challenge.rewardColor)}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-indigo-700 bg-indigo-50 font-semibold">{challenge.category}</Badge>
                    {!isCompleted && (
                      <Badge variant="outline" className="text-gray-500 flex items-center gap-1 border-gray-200">
                        <Target className="w-3 h-3" /> {challenge.daysLeft} days left
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 pr-12 leading-tight">
                    {challenge.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">{challenge.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-600 uppercase tracking-wider text-xs">Progress</span>
                      <span className={isCompleted ? "text-green-600" : "text-indigo-600"}>
                        {challenge.progress} <span className="text-gray-400 font-normal">/ {challenge.goal} {challenge.unit}</span>
                      </span>
                    </div>
                    <Progress 
                      value={(challenge.progress / challenge.goal) * 100} 
                      className={`h-2.5 bg-gray-100 ${isCompleted ? '[&>div]:bg-green-500' : '[&>div]:bg-indigo-600'}`} 
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0 pb-6 px-6">
                  <div className="w-full flex gap-3">
                    <Dialog open={selectedChallenge?.id === challenge.id} onOpenChange={(open) => !open ? setSelectedChallenge(null) : setSelectedChallenge(challenge)}>
                      <DialogTrigger asChild>
                        <Button 
                          className={`flex-1 font-semibold shadow-sm transition-colors ${
                            isCompleted 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`} 
                          disabled={isCompleted}
                        >
                          {isCompleted ? 'Goal Reached!' : 'Log Activity'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-2xl">
                        <DialogHeader className="space-y-3">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                            <Target className="w-6 h-6 text-indigo-600" />
                          </div>
                          <DialogTitle className="text-2xl">Log Activity: {challenge.title}</DialogTitle>
                          <DialogDescription className="text-base text-gray-500">
                            Enter the amount of {challenge.unit} you want to log to make progress towards your goal.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="flex flex-col gap-3">
                            <Label htmlFor="value" className="text-sm font-semibold text-gray-700">
                              Amount ({challenge.unit})
                            </Label>
                            <Input
                              id="value"
                              type="number"
                              value={logValue}
                              onChange={(e) => setLogValue(e.target.value)}
                              className="h-12 text-lg px-4 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                              placeholder={`e.g. 5`}
                              autoFocus
                            />
                          </div>
                        </div>
                        <DialogFooter className="mt-4 gap-3 sm:gap-0">
                          <Button variant="outline" onClick={() => setSelectedChallenge(null)} className="h-11 px-6 font-semibold text-gray-600">Cancel</Button>
                          <Button onClick={handleLogActivity} className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm">
                            Submit Log
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardFooter>
              </Card>
            )})}
            {filteredChallenges.length === 0 && (
              <div className="col-span-1 md:col-span-2 py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No challenges found</h3>
                <p className="text-gray-500">There are currently no active challenges in this category.</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilterCategory('All')}>View All</Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Leaderboard */}
        <div className="space-y-6">
          <Card className="shadow-lg border-gray-200 overflow-hidden sticky top-8">
            <div className="bg-gradient-to-br from-gray-900 to-indigo-900 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <Target className="w-10 h-10 text-indigo-300 mx-auto mb-3 relative z-10" />
              <h3 className="text-xl font-bold relative z-10">Company Leaderboard</h3>
              <p className="text-indigo-200 text-sm mt-1 relative z-10">Top volunteers this month</p>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {leaderboard.map((user, index) => {
                  const rank = index + 1;
                  const isYou = user.id === currentUser?.uid;
                  return (
                  <div key={user.id} className={`flex items-center justify-between p-4 transition-colors ${isYou ? 'bg-indigo-50/80 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                        rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 ring-2 ring-yellow-200 ring-offset-1' : 
                        rank === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 ring-2 ring-gray-100 ring-offset-1' : 
                        rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900 ring-2 ring-orange-100 ring-offset-1' : 
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {rank}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isYou ? 'text-indigo-900' : 'text-gray-900'}`}>
                          {isYou ? 'You (Current Rank)' : user.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-gray-900">{user.hours}</span>
                      <span className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">hrs</span>
                    </div>
                  </div>
                )})}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center">
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                View Full Leaderboard <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
