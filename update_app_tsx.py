import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_statement = "import { ProjectReminders } from './components/ProjectReminders';\n"

if 'ProjectReminders' not in content:
    content = content.replace("import { ProtectedRoute } from './components/ProtectedRoute';", "import { ProtectedRoute } from './components/ProtectedRoute';\n" + import_statement)
    
    # Add it inside <VolunteerProvider> or <AuthProvider>
    content = content.replace(
        "<Toaster position=\"top-center\" richColors expand={true} />",
        "<Toaster position=\"top-center\" richColors expand={true} />\n        <ProjectReminders />"
    )
    
    with open('src/App.tsx', 'w') as f:
        f.write(content)
