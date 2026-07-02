with open('src/pages/EmployeeDashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace('<CSRNewsFeed isAdmin={false} />', '<CSRNewsFeed isAdmin={true} />')

with open('src/pages/EmployeeDashboard.tsx', 'w') as f:
    f.write(code)

