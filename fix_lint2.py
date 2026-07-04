import re
with open('src/pages/CharityOnboarding.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { getAuth } from 'firebase/auth';", "import { getAuth } from 'firebase/auth';\nimport { toast } from 'sonner';")
with open('src/pages/CharityOnboarding.tsx', 'w') as f:
    f.write(content)

with open('src/components/layout/DashboardLayout.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { LayoutDashboard,", "import { LayoutDashboard, MessageSquare,")
with open('src/components/layout/DashboardLayout.tsx', 'w') as f:
    f.write(content)

with open('src/pages/Charities.tsx', 'r') as f:
    content = f.read()

content = content.replace("setDonationAmount(val.replace(/[^0-9]/g, ''));", "setDonationAmount(parseInt(val.replace(/[^0-9]/g, '')) || 0);")
with open('src/pages/Charities.tsx', 'w') as f:
    f.write(content)

with open('src/pages/CompanySkillVerification.tsx', 'r') as f:
    content = f.read()

content = content.replace("const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));", "const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));")
with open('src/pages/CompanySkillVerification.tsx', 'w') as f:
    f.write(content)

