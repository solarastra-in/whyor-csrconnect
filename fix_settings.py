import re
with open('src/pages/CompanySettings.tsx', 'r') as f:
    content = f.read()

old_smtp = """  const handleSaveSmtp = async () => {
    if (!company) return;
    try {
      const { pass, ...publicSmtpSettings } = smtpSettings;
      await updateDoc(doc(db, 'companies', company.id), {
        smtpSettings: publicSmtpSettings
      });
      toast.success('SMTP configuration saved successfully (password stored securely)');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save SMTP configuration');
    }
  };"""

new_smtp = """  const handleSaveSmtp = async () => {
    if (!company) return;
    try {
      // Get the Firebase token
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`/api/company/${company.id}/smtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(smtpSettings)
      });
      
      if (!response.ok) {
        throw new Error("Failed to save via API");
      }
      
      // Still store non-sensitive config in public doc so UI knows it's configured
      const { pass, ...publicSmtpSettings } = smtpSettings;
      await updateDoc(doc(db, 'companies', company.id), {
        smtpSettings: publicSmtpSettings
      });
      
      toast.success('SMTP configuration saved securely');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save SMTP configuration');
    }
  };"""

content = content.replace(old_smtp, new_smtp)

if "import { getAuth } from 'firebase/auth';" not in content:
    content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport { getAuth } from 'firebase/auth';")

with open('src/pages/CompanySettings.tsx', 'w') as f:
    f.write(content)
