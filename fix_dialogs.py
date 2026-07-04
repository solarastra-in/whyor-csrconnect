import os
import re

files_with_dialogs = [
    'src/pages/Charities.tsx',
    'src/pages/Companies.tsx',
    'src/pages/CompanyGrants.tsx',
    'src/pages/CompanySettings.tsx',
    'src/pages/EmployeeERGs.tsx',
    'src/pages/DiscoverProjects.tsx',
    'src/pages/LandingPage.tsx',
    'src/pages/Challenges.tsx'
]

for file in files_with_dialogs:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        content = f.read()

    # We want to increase sm:max-w-[425px] or similar small sizes to sm:max-w-2xl for clarity.
    # But for some very simple dialogs (like just a button click), maybe max-w-lg is better.
    # Let's standardize on sm:max-w-xl or sm:max-w-2xl, and add p-6 sm:p-8 if it's not p-0.
    
    # We will just do some generic replacements where max-w is small
    content = re.sub(r'sm:max-w-\[425px\]', r'sm:max-w-xl', content)
    content = re.sub(r'sm:max-w-\[500px\]', r'sm:max-w-xl', content)
    content = re.sub(r'sm:max-w-\[600px\]', r'sm:max-w-2xl', content)
    
    # Add better padding if not present and not p-0
    # Wait, DialogContent from shadcn already has p-6. Let's just adjust max-w.
    
    with open(file, 'w') as f:
        f.write(content)
