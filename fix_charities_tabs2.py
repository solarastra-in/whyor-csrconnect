import re
with open('src/pages/Charities.tsx', 'r') as f:
    content = f.read()

# Let's clean up the broken tags by finding the <Tabs defaultValue="all" className="w-full"> and replacing the whole block.
start_idx = content.find('<Tabs defaultValue="all" className="w-full">')
end_idx = content.find('</CardContent>', start_idx)
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + '<div className="overflow-x-auto">\n                <Table>' + content[end_idx:]

with open('src/pages/Charities.tsx', 'w') as f:
    f.write(content)
