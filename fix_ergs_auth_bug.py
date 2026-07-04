import re

files_to_fix = [
    'src/pages/EmployeeERGs.tsx',
    'src/pages/CompanyERGs.tsx'
]

for file in files_to_fix:
    with open(file, 'r') as f:
        content = f.read()

    # Find the useEffect block
    # useEffect(() => { fetchERGs(); }, []);
    content = re.sub(
        r'useEffect\(\(\) => \{\n\s*fetchERGs\(\);\n\s*\}, \[\]\);',
        'useEffect(() => {\n    if (user) {\n      fetchERGs();\n    }\n  }, [user]);',
        content
    )
    
    with open(file, 'w') as f:
        f.write(content)
