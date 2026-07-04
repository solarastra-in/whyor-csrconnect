import re
import os

file = 'src/pages/DiscoverProjects.tsx'
with open(file, 'r') as f:
    content = f.read()

content = content.replace(
    '<DialogContent className={isCompanyAdmin ? "max-w-2xl" : ""}>',
    '<DialogContent className={isCompanyAdmin ? "sm:max-w-2xl p-6 sm:p-8" : "sm:max-w-xl p-6 sm:p-8"}>'
)

with open(file, 'w') as f:
    f.write(content)
