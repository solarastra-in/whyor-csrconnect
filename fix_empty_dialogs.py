import re
import os

files_with_dialogs = [
    'src/pages/Charities.tsx',
    'src/pages/Companies.tsx',
    'src/pages/DiscoverProjects.tsx',
]

for file in files_with_dialogs:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        content = f.read()

    content = re.sub(r'<DialogContent>', r'<DialogContent className="sm:max-w-xl p-6 sm:p-8">', content)

    with open(file, 'w') as f:
        f.write(content)
