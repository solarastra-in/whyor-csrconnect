import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Award, Star, Trophy, Medal, Heart } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/src/contexts/AuthContext';

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const AVAILABLE_BADGES: BadgeDef[] = [
  { id: 'first_hour', title: 'First Volunteer Hour', description: 'Logged your very first hour of volunteering.', icon: <Medal className="h-6 w-6 text-blue-500" /> },
  { id: 'project_lead', title: 'Project Lead', description: 'Took initiative to lead a community project.', icon: <Star className="h-6 w-6 text-yellow-500" /> },
  { id: 'community_champion', title: 'Community Champion', description: 'Consistently contributed to multiple causes.', icon: <Trophy className="h-6 w-6 text-purple-500" /> },
  { id: 'donation_hero', title: 'Donation Hero', description: 'Made a significant matched donation.', icon: <Heart className="h-6 w-6 text-red-500" /> }
];

interface VolunteerContextType {
  totalHours: number;
  addHours: (amount: number, projectName: string) => void;
  milestonesReached: number[];
  userSkills: string[];
  setUserSkills: (skills: string[]) => void;
  earnedBadges: string[];
  communityPoints: number;
  addCommunityPoints: (amount: number) => void;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export function VolunteerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [totalHours, setTotalHours] = useState<number>(0);
  const [milestonesReached, setMilestonesReached] = useState<number[]>([]);
  const [userSkills, setUserSkillsState] = useState<string[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>(['project_lead', 'donation_hero']); // Pre-filled for demo
  const [communityPoints, setCommunityPoints] = useState<number>(0);

  // We can initialize it with 0 or a mock value like 8 to allow users to easily test the 10 hour milestone
  useEffect(() => {
    // Read from localStorage to persist
    const stored = localStorage.getItem('volunteer_hours');
    if (stored) {
      setTotalHours(parseFloat(stored));
    } else {
      // Set to 8 hours initially to demonstrate milestones easily
      setTotalHours(8); 
      localStorage.setItem('volunteer_hours', '8');
    }

    const storedMilestones = localStorage.getItem('volunteer_milestones');
    if (storedMilestones) {
      setMilestonesReached(JSON.parse(storedMilestones));
    }

    const storedSkills = localStorage.getItem('volunteer_skills');
    if (storedSkills) {
      try {
        setUserSkillsState(JSON.parse(storedSkills));
      } catch(e) {}
    } else {
      setUserSkillsState(['Public Speaking']); // default skill example
    }

    const storedPoints = localStorage.getItem('volunteer_points');
    if (storedPoints) {
      setCommunityPoints(parseInt(storedPoints, 10));
    } else {
      setCommunityPoints(150);
      localStorage.setItem('volunteer_points', '150');
    }
  }, []);

  useEffect(() => {
    // Dynamically unlock badges based on hours
    setEarnedBadges(prev => {
      const newBadges = new Set(prev);
      if (totalHours >= 1) newBadges.add('first_hour');
      if (totalHours >= 50) newBadges.add('community_champion');
      return Array.from(newBadges);
    });
  }, [totalHours]);

  const setUserSkills = (skills: string[]) => {
    setUserSkillsState(skills);
    localStorage.setItem('volunteer_skills', JSON.stringify(skills));
  };

  const milestones = [
    { threshold: 10, title: 'Bronze Volunteer', icon: <Star className="h-6 w-6 text-amber-600" /> },
    { threshold: 50, title: 'Silver Volunteer', icon: <Award className="h-6 w-6 text-gray-400" /> },
    { threshold: 100, title: 'Gold Volunteer', icon: <Trophy className="h-6 w-6 text-yellow-500" /> },
  ];

  const addCommunityPoints = (amount: number) => {
    setCommunityPoints(prev => {
      const next = prev + amount;
      localStorage.setItem('volunteer_points', next.toString());
      return next;
    });
  };

  const addHours = (amount: number, projectName: string) => {
    const newTotal = totalHours + amount;
    setTotalHours(newTotal);
    localStorage.setItem('volunteer_hours', newTotal.toString());

    toast.success(`Successfully pledged ${amount} hours for ${projectName}!`, {
      description: `You now have ${newTotal} total volunteer hours.`,
    });

    // Check milestones
    milestones.forEach((milestone) => {
      if (newTotal >= milestone.threshold && !milestonesReached.includes(milestone.threshold)) {
        // We reached a new milestone
        setMilestonesReached((prev) => {
          const next = [...prev, milestone.threshold];
          localStorage.setItem('volunteer_milestones', JSON.stringify(next));
          return next;
        });

        // Delay the milestone toast slightly so it shows after the pledge toast
        setTimeout(() => {
          toast(
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  {milestone.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Milestone Reached!</h3>
                  <p className="text-gray-600 font-medium">{milestone.title}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Incredible work! You've officially surpassed {milestone.threshold} volunteer hours.
              </p>
            </div>,
            { duration: 8000, className: "min-w-[350px]" }
          );
        }, 800);

        // Broadcast to colleagues via Firestore
        if (user) {
          try {
            addDoc(collection(db, 'milestones'), {
              userId: user.uid,
              userName: user.displayName || 'A team member',
              title: milestone.title,
              threshold: milestone.threshold,
              createdAt: serverTimestamp()
            });
          } catch (error) {
            console.error('Failed to broadcast milestone:', error);
          }
        }
      }
    });
  };

  return (
    <VolunteerContext.Provider value={{ totalHours, addHours, milestonesReached, userSkills, setUserSkills, earnedBadges, communityPoints, addCommunityPoints }}>
      {children}
    </VolunteerContext.Provider>
  );
}

export function useVolunteer() {
  const context = useContext(VolunteerContext);
  if (context === undefined) {
    throw new Error('useVolunteer must be used within a VolunteerProvider');
  }
  return context;
}
