import { useEffect } from 'react';
import { toast } from 'sonner';
import { upcomingSessions, Project } from '../pages/DiscoverProjects';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export function ProjectReminders() {
  useEffect(() => {
    const checkReminders = () => {
      const pledgedProjectsJSON = localStorage.getItem('pledgedProjects');
      if (!pledgedProjectsJSON) return;
      
      let pledgedProjectIds: string[] = [];
      try {
        pledgedProjectIds = JSON.parse(pledgedProjectsJSON);
      } catch (e) {
        return;
      }

      if (pledgedProjectIds.length === 0) return;

      getDocs(collection(db, 'projects')).then(snap => {
        const allProjects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        const pledgedNames = allProjects
          .filter(p => pledgedProjectIds.includes(p.id))
          .map(p => p.name);
          
        const now = new Date();
        const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

        upcomingSessions.forEach(session => {
          // If the session has a project associated, we would check it here.
          // Since upcomingSessions currently doesn't have a 'project' field, we'll assume it applies to all or skip.
          // Actually, we can just skip the check if session.project is not defined.
          const sessionProject = (session as any).project;
          if (sessionProject && pledgedNames.includes(sessionProject)) {
            const sessionDate = new Date(session.date);
            const timeDiff = sessionDate.getTime() - now.getTime();
            
            if (timeDiff > 0 && timeDiff <= TWENTY_FOUR_HOURS_MS) { 
               const remindedIdsJSON = localStorage.getItem('remindedSessions');
               let remindedIds: number[] = [];
               if (remindedIdsJSON) {
                  try {
                    remindedIds = JSON.parse(remindedIdsJSON);
                  } catch(e) {}
               }
               
               if (!remindedIds.includes(session.id)) {
                  toast(`Reminder: Upcoming ${session.type}`, {
                     description: `You have an upcoming ${session.type.toLowerCase()} for "${sessionProject}": ${session.title} is in less than 24 hours.`,
                     duration: 10000,
                  });
                  remindedIds.push(session.id);
                  localStorage.setItem('remindedSessions', JSON.stringify(remindedIds));
               }
            }
          }
        });
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
