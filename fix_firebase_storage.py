import re
with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

if 'getStorage' not in content:
    content = content.replace("import { initializeFirestore } from 'firebase/firestore';", "import { initializeFirestore } from 'firebase/firestore';\nimport { getStorage } from 'firebase/storage';")
    content = content.replace("export const auth = getAuth(app);", "export const auth = getAuth(app);\nexport const storage = getStorage(app);")

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
