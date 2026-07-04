import re

with open('src/pages/CompanyGrants.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """  useEffect(() => {
    fetchGrants();
  }, []);""",
    """  useEffect(() => {
    if (user) {
      fetchGrants();
    }
  }, [user]);"""
)

with open('src/pages/CompanyGrants.tsx', 'w') as f:
    f.write(content)
