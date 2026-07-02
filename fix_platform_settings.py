import re
with open('src/pages/PlatformSettings.tsx', 'r') as f:
    content = f.read()

old_smtp = """  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Logic for saving would go here
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Platform SMTP configuration saved successfully (password stored securely)');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };"""

new_smtp = """  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch('/api/platform/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(smtpSettings)
      });
      
      if (!response.ok) throw new Error("Failed");
      toast.success('Platform SMTP configuration saved securely');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };"""

content = content.replace(old_smtp, new_smtp)

if "import { getAuth } from 'firebase/auth';" not in content:
    content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport { getAuth } from 'firebase/auth';")

with open('src/pages/PlatformSettings.tsx', 'w') as f:
    f.write(content)
