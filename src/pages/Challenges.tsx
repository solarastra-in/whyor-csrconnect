import { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/src/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Star, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVolunteer } from '@/src/contexts/VolunteerContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const initialChallenges = [
  {
    id: 1,
    title: 'Q3 Tech For Good',
    description: 'Contribute your technical skills to NGOs. Reach 100 hours collectively as an engineering team.',
    progress: 85,
    goal: 100,
    unit: 'hours',
    team: 'Engineering',
    daysLeft: 12,
    active: true
  },
  {
    id: 2,
    title: 'Green Office Initiative',
    description: 'Participate in local tree plantation drives or cleanups. First team to 50 participants wins.',
    progress: 32,
    goal: 50,
    unit: 'participants',
    team: 'Company-wide',
    daysLeft: 5,
    active: true
  }
];

export function Challenges() {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [logValue, setLogValue] = useState('');
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
      setLeaderboard(topUsers);
    }, (error) => console.error(error));
    return () => unsub();
  }, []);

  const handleLogActivity = (challengeId: number) => {
    const value = parseInt(logValue);
    if (isNaN(value) || value <= 0) return;

    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, progress: Math.min(c.goal, c.progress + value) } : c
    ));
    setLogValue('');
    toast.success('Activity logged successfully! Keep up the good work.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Challenges & Leaderboards</h1>
        <p className="text-gray-500 mt-1">Join team challenges, earn badges, and see how you rank among your peers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Active Challenges</h2>
          {challenges.map((challenge) => (
            <Card key={challenge.id} className={`overflow-hidden border-l-4 ${challenge.progress >= challenge.goal ? 'border-l-green-500' : 'border-l-indigo-500'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      {challenge.title}
                      {challenge.progress >= challenge.goal && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{challenge.team}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {challenge.daysLeft} days left
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">{challenge.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-700">Progress</span>
                    <span className={challenge.progress >= challenge.goal ? "text-green-600 font-bold" : "text-indigo-600"}>
                      {challenge.progress} / {challenge.goal} {challenge.unit}
                    </span>
                  </div>
                  <Progress value={(challenge.progress / challenge.goal) * 100} className={`h-2 bg-gray-100 ${challenge.progress >= challenge.goal ? '[&>div]:bg-green-500' : '[&>div]:bg-indigo-600'}`} />
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Dialog>
                    <DialogTrigger render={<Button className="bg-indigo-600 text-white hover:bg-indigo-700" disabled={challenge.progress >= challenge.goal} />}>
                      {challenge.progress >= challenge.goal ? 'Completed' : 'Log Activity'}
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Log Activity: {challenge.title}</DialogTitle>
                        <DialogDescription>
                          Enter the amount of {challenge.unit} you want to log for this challenge.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="value" className="text-right">
                            {challenge.unit.charAt(0).toUpperCase() + challenge.unit.slice(1)}
                          </Label>
                          <Input
                            id="value"
                            type="number"
                            value={logValue}
                            onChange={(e) => setLogValue(e.target.value)}
                            className="col-span-3"
                            placeholder={`e.g. 5`}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => handleLogActivity(challenge.id)}>Log {challenge.unit}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" onClick={() => toast('Challenge details would open here')}>View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Your Achievements</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center p-4">
              <Medal className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Top Fundraiser</h4>
              <p className="text-xs text-gray-500 mt-1">July 2024</p>
            </Card>
            <Card className="text-center p-4">
              <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">10h Volunteer</h4>
              <p className="text-xs text-gray-500 mt-1">Milestone reached</p>
            </Card>
            <Card className="text-center p-4 col-span-2 bg-gradient-to-br from-amber-100 to-orange-50 border-orange-200">
              <Trophy className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h4 className="font-semibold text-sm text-orange-900">Rising Star</h4>
              <p className="text-xs text-orange-700 mt-1">Completed first company match</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Leaderboard</CardTitle>
              <CardDescription>Top volunteers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((user, index) => {
                  const rank = index + 1;
                  const isYou = user.id === currentUser?.uid;
                  return (
                  <div key={user.id} className={`flex items-center justify-between p-2 rounded-lg ${isYou ? 'bg-blue-50 border border-blue-100' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                        rank === 2 ? 'bg-gray-200 text-gray-700' : 
                        rank === 3 ? 'bg-orange-100 text-orange-700' : 
                        'text-gray-500'
                      }`}>
                        {rank}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{isYou ? 'You' : user.name}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{user.hours}h</span>
                  </div>
                )})}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
