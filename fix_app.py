import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

if "import { PlatformSupport }" not in content:
    content = content.replace("import { PlatformSettings } from './pages/PlatformSettings';", "import { PlatformSettings } from './pages/PlatformSettings';\nimport { PlatformSupport } from './pages/PlatformSupport';")

if '<Route path="support" element={<PlatformSupport />} />' not in content:
    content = content.replace('<Route path="settings" element={<PlatformSettings />} />', '<Route path="support" element={<PlatformSupport />} />\n          <Route path="settings" element={<PlatformSettings />} />')

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/layout/DashboardLayout.tsx', 'r') as f:
    content = f.read()

if "path: '/admin/support'" not in content:
    old_nav = "{ name: 'Settings', path: '/admin/settings', icon: Settings }"
    new_nav = "{ name: 'Support', path: '/admin/support', icon: MessageSquare },\n  { name: 'Settings', path: '/admin/settings', icon: Settings }"
    content = content.replace(old_nav, new_nav)
    content = content.replace("import { Building2, Users, FileText, Settings, Menu, Bell } from 'lucide-react';", "import { Building2, Users, FileText, Settings, Menu, Bell, MessageSquare } from 'lucide-react';")

with open('src/components/layout/DashboardLayout.tsx', 'w') as f:
    f.write(content)
