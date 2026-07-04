import re
with open('src/pages/CharityOnboarding.tsx', 'r') as f:
    content = f.read()

if 'import { storage } from' not in content:
    content = content.replace("import { db } from '@/src/lib/firebase';", "import { db, storage } from '@/src/lib/firebase';")

if 'ref, uploadBytes, getDownloadURL' not in content:
    content = content.replace("import { collection, addDoc } from 'firebase/firestore';", "import { collection, addDoc } from 'firebase/firestore';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';")


new_handle = """  const handleComplete = async () => {
    if (!file) {
      setErrors({ file: 'Please upload the required legal documents' });
      toast.error('Please fix the errors before submitting');
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      let documentUrl = '';
      if (file) {
        const fileRef = ref(storage, `charity-documents/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        documentUrl = await getDownloadURL(fileRef);
      }
      
      await addDoc(collection(db, 'charities'), {
        name: formData.orgName || formData.name,
        focus: formData.focusArea,
        location: formData.headquarters,
        website: formData.website,
        summary: formData.rawDescription,
        status: 'pending_verification',
        promotors: user ? user.email : '',
        submittedBy: user ? user.uid : '',
        documentUrl,
        createdAt: new Date().getTime(),
        activeProjects: []
      });
      
      localStorage.removeItem('charityOnboardingDraft');
      toast.success('Charity registration submitted for review!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit registration');
    }
  };"""

content = re.sub(r'  const handleComplete = async \(\) => \{.*?\n  \};', new_handle, content, flags=re.DOTALL)

with open('src/pages/CharityOnboarding.tsx', 'w') as f:
    f.write(content)
