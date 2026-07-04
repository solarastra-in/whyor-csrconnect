import re

with open('src/pages/DiscoverProjects.tsx', 'r') as f:
    content = f.read()

# Replace the static upcomingSessions with a dynamic one for demo purposes
dynamic_sessions = """const tomorrow = new Date();
tomorrow.setHours(tomorrow.getHours() + 23); // 23 hours from now

export const upcomingSessions = [
  { id: 1, date: tomorrow.toISOString(), title: 'Riverbank Cleanup Crew Orientation', project: 'Clean Ganga Initiative', type: 'Session' },
  { id: 2, date: '2026-07-10T17:00:00Z', title: 'Registration Deadline', project: 'Clean Ganga Initiative', type: 'Deadline' },
  { id: 3, date: '2026-07-12T10:00:00Z', title: 'Coding Bootcamp Kickoff', project: 'Digital Skills for Youth', type: 'Session' },
  { id: 4, date: '2026-07-15T12:00:00Z', title: 'Sapling Planting Deadline', project: 'Urban Afforestation', type: 'Deadline' },
  { id: 5, date: '2026-07-20T08:00:00Z', title: 'Solar Panel Installation Workshop', project: 'Solar for Villages', type: 'Session' },
];"""

content = re.sub(
    r'export const upcomingSessions = \[[\s\S]*?\];',
    dynamic_sessions,
    content
)

with open('src/pages/DiscoverProjects.tsx', 'w') as f:
    f.write(content)
