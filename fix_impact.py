import re
with open('src/pages/CompanyImpactReports.tsx', 'r') as f:
    content = f.read()

if 'Badge' not in content:
    content = content.replace("import { Button } from '@/components/ui/button';", "import { Button } from '@/components/ui/button';\nimport { Badge } from '@/components/ui/badge';")

with open('src/pages/CompanyImpactReports.tsx', 'w') as f:
    f.write(content)
