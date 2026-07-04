const fs = require('fs');
let content = fs.readFileSync('src/lib/userRole.ts', 'utf8');

content = content.replace(
  `  if (!user || !user.email) {
    return { role: 'none' };
  }`,
  `  if (!user) {
    return { role: 'none' };
  }
  
  if (user.isAnonymous) {
    return {
      role: 'employee',
      company: { id: 'demo_company', name: 'Demo Corp', adminEmails: [], allowedDomains: [] } as Company
    };
  }
  
  if (!user.email) {
    return { role: 'none' };
  }`
);

fs.writeFileSync('src/lib/userRole.ts', content);
