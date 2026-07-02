import re
with open('src/pages/CharityOnboarding.tsx', 'r') as f:
    content = f.read()

old_func = """  const handleComplete = () => {
    if (!file) {
      setErrors({ file: 'Please upload the required legal documents' });
      toast.error('Please fix the errors before submitting');
      return;
    }
    // In a real app, this would save to Firestore
    toast.success('Registration submitted successfully!');
    navigate('/admin/charities');
  };"""

new_func = """  const handleComplete = async () => {
    if (!file) {
      setErrors({ file: 'Please upload the required legal documents' });
      toast.error('Please fix the errors before submitting');
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      await addDoc(collection(db, 'projects'), {
        name: formData.orgName,
        focus: formData.focusArea,
        location: formData.headquarters,
        website: formData.website,
        summary: formData.rawDescription,
        status: 'pending_verification',
        promotors: user ? user.email : '',
        createdAt: new Date().getTime(),
        activeProjects: []
      });
      
      toast.success('Charity registration submitted for review!');
      navigate('/admin/charities');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit registration');
    }
  };"""

content = content.replace(old_func, new_func)

if "import { db } from '@/lib/firebase';" not in content:
    content = "import { db } from '@/lib/firebase';\nimport { collection, addDoc } from 'firebase/firestore';\n" + content

with open('src/pages/CharityOnboarding.tsx', 'w') as f:
    f.write(content)
