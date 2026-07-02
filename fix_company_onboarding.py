import re
with open('src/pages/CompanyOnboarding.tsx', 'r') as f:
    content = f.read()

old_func = """  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      toast.success('Company setup completed successfully!');
      navigate('/company');
    }
  };"""

new_func = """  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error("Not authenticated");
        
        await addDoc(collection(db, 'companies'), {
          name: formData.companyName,
          industry: formData.industry,
          website: formData.website,
          about: formData.about,
          brandColor: formData.brandColor,
          autoMatch: formData.autoMatch,
          adminEmails: [user.email.toLowerCase()],
          allowedDomains: [user.email.split('@')[1].toLowerCase()],
          status: 'pending_review',
          createdAt: new Date().getTime()
        });
        
        // Sync claims
        const token = await user.getIdToken(true);
        await fetch('/api/auth/sync-claims', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        toast.success('Company registration submitted for review!');
        navigate('/company');
      } catch (error) {
        console.error(error);
        toast.error('Failed to register company.');
      }
    }
  };"""

content = content.replace(old_func, new_func)

if "import { db } from '@/lib/firebase';" not in content:
    content = "import { db } from '@/lib/firebase';\nimport { collection, addDoc } from 'firebase/firestore';\nimport { getAuth } from 'firebase/auth';\n" + content

with open('src/pages/CompanyOnboarding.tsx', 'w') as f:
    f.write(content)
