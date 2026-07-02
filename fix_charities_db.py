with open('src/pages/CharityOnboarding.tsx', 'r') as f:
    content = f.read()

content = content.replace("collection(db, 'projects')", "collection(db, 'charities')")

with open('src/pages/CharityOnboarding.tsx', 'w') as f:
    f.write(content)
