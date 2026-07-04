import re
with open('src/pages/DiscoverProjects.tsx', 'r') as f:
    content = f.read()

content = content.replace("const upcomingSessions = [", "export const upcomingSessions = [")

with open('src/pages/DiscoverProjects.tsx', 'w') as f:
    f.write(content)
