import re
with open('src/pages/CompanySkillVerification.tsx', 'r') as f:
    content = f.read()

content = content.replace("let data = requestsData;", "let data: any[] = requestsData;")

with open('src/pages/CompanySkillVerification.tsx', 'w') as f:
    f.write(content)
