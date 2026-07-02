import re
with open('src/contexts/VolunteerContext.tsx', 'r') as f:
    content = f.read()

old_snapshot = """      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setTotalHours(data.totalHours || 0);
          setCommunityPoints(data.communityPoints || 0);
          setMilestonesReached(data.milestonesReached || []);
          
          // Check for new milestones based on hours
          const currentHours = data.totalHours || 0;
          const currentPoints = data.communityPoints || 0;
          const currentMilestones = data.milestonesReached || [];
          
          let newMilestones = [...currentMilestones];
          let updated = false;
          
          if (currentHours >= 10 && !newMilestones.includes('first_10_hours')) {
            newMilestones.push('first_10_hours');
            updated = true;
          }
          if (currentHours >= 50 && !newMilestones.includes('50_hours')) {
            newMilestones.push('50_hours');
            updated = true;
          }
          if (currentHours >= 100 && !newMilestones.includes('100_hours')) {
            newMilestones.push('100_hours');
            updated = true;
          }
          if (currentPoints >= 1000 && !newMilestones.includes('top_contributor')) {
            newMilestones.push('top_contributor');
            updated = true;
          }
          
          if (updated) {
            setDoc(doc.ref, { milestonesReached: newMilestones }, { merge: true });
          }
        }
      });"""

new_snapshot = """      const unsubscribe = onSnapshot(doc(db, `users/${user.uid}/summary/impact`), (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setTotalHours(data.totalHours || 0);
          setCommunityPoints(data.communityPoints || 0);
          setMilestonesReached(data.milestonesReached || []);
        } else {
          setTotalHours(0);
          setCommunityPoints(0);
          setMilestonesReached([]);
        }
      });"""

content = content.replace(old_snapshot, new_snapshot)

with open('src/contexts/VolunteerContext.tsx', 'w') as f:
    f.write(content)
