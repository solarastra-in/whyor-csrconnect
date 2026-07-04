import re
with open('src/pages/Charities.tsx', 'r') as f:
    content = f.read()

content = content.replace("mockMap.set(f.id, f as any)", "mockMap.set(f.id as unknown as number, f as any)")

with open('src/pages/Charities.tsx', 'w') as f:
    f.write(content)
