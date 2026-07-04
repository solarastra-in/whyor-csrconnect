import { useEffect } from 'react';
import { toast } from 'sonner';
import { mockProjects, upcomingSessions } from '../pages/DiscoverProjects';

export function ProjectReminders() {
  useEffect(() => {
    const checkReminders = () => {
      const pledgedProjectsJSON = localStorage.getItem('pledgedProjects');
      if (!pledgedProjectsJSON) return;
      
      let pledgedProjectIds: number[] = [];
      try {
        pledgedProjectIds = JSON.parse(pledgedProjectsJSON);
      } catch (e) {
        return;
      }

      if (pledgedProjectIds.length === 0) return;

      const pledgedNames = mockProjects
        .filter(p => pledgedProjectIds.includes(p.id))
        .map(p => p.name);

      const now = new Date();
      const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

      upcomingSessions.forEach(session => {
        if (pledgedNames.includes(session.project)) {
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
                   description: `You have an upcoming ${session.type.toLowerCase()} for "${session.project}": ${session.title} is in less than 24 hours.`,
                   duration: 10000,
                });
                remindedIds.push(session.id);
                localStorage.setItem('remindedSessions', JSON.stringify(remindedIds));
             }
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
