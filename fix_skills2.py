import re
with open('src/pages/CompanySkillVerification.tsx', 'r') as f:
    content = f.read()

content = content.replace("let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));", "let data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));")

with open('src/pages/CompanySkillVerification.tsx', 'w') as f:
    f.write(content)
