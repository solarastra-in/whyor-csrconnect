import re
with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));",
                          "const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));")
with open('server.ts', 'w') as f:
    f.write(content)

with open('src/components/layout/DashboardLayout.tsx', 'r') as f:
    content = f.read()

if 'MessageSquare' not in content and 'lucide-react' in content:
    content = content.replace("import { Menu", "import { MessageSquare, Menu")
    
with open('src/components/layout/DashboardLayout.tsx', 'w') as f:
    f.write(content)

with open('src/pages/Charities.tsx', 'r') as f:
    content = f.read()

# Argument of type 'string' is not assignable to parameter of type 'number'.
content = content.replace("setDonationAmount(val.replace(/[^0-9]/g, ''));", "setDonationAmount(parseInt(val.replace(/[^0-9]/g, '')) || 0);")

with open('src/pages/Charities.tsx', 'w') as f:
    f.write(content)

with open('src/pages/CharityOnboarding.tsx', 'r') as f:
    content = f.read()

if 'import { toast }' not in content:
    content = content.replace("import { Button }", "import { Button }\nimport { toast } from 'sonner';")
if 'getAuth' in content and 'firebase/auth' not in content:
    content = content.replace("import { auth }", "import { auth }\nimport { getAuth } from 'firebase/auth';")

with open('src/pages/CharityOnboarding.tsx', 'w') as f:
    f.write(content)

with open('src/pages/CompanyImpactReports.tsx', 'r') as f:
    content = f.read()

if 'import { Badge }' not in content:
    content = content.replace("import { Button } from '@/components/ui/button';", "import { Button } from '@/components/ui/button';\nimport { Badge } from '@/components/ui/badge';")

with open('src/pages/CompanyImpactReports.tsx', 'w') as f:
    f.write(content)

with open('src/pages/CompanySkillVerification.tsx', 'r') as f:
    content = f.read()

content = content.replace("const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));",
                          "const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));")

with open('src/pages/CompanySkillVerification.tsx', 'w') as f:
    f.write(content)
