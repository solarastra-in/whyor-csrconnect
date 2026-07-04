import re
with open('src/pages/CharityOnboarding.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { auth }\nimport { getAuth } from 'firebase/auth'; from '@/src/lib/firebase';",
    "import { auth } from '@/src/lib/firebase';\nimport { getAuth } from 'firebase/auth';"
)

with open('src/pages/CharityOnboarding.tsx', 'w') as f:
    f.write(content)
