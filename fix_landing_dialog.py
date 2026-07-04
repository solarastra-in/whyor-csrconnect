import re
import os

file = 'src/pages/LandingPage.tsx'
with open(file, 'r') as f:
    content = f.read()

content = content.replace(
    '<DialogContent className="sm:max-w-xl">',
    '<DialogContent className="sm:max-w-xl p-6 sm:p-8">'
)

with open(file, 'w') as f:
    f.write(content)
