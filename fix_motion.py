import re
with open('src/components/DonationGames.tsx', 'r') as f:
    content = f.read()

content = content.replace("from 'motion/react'", "from 'framer-motion'")

with open('src/components/DonationGames.tsx', 'w') as f:
    f.write(content)
