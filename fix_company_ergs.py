import re
with open('src/pages/CompanyERGs.tsx', 'r') as f:
    content = f.read()

# Fix `user` import
if 'useAuth' not in content:
    content = content.replace("import { db } from '@/src/lib/firebase';", "import { db } from '@/src/lib/firebase';\nimport { useAuth } from '@/src/contexts/AuthContext';")

if 'const { user } = useAuth();' not in content:
    content = content.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n  const { user } = useAuth();')

with open('src/pages/CompanyERGs.tsx', 'w') as f:
    f.write(content)
