with open('src/pages/Companies.tsx', 'r') as f:
    content = f.read()

old_approve = """  const handleApprove = async (companyId: string) => {
    try {
      await updateDoc(doc(db, 'companies', companyId), { status: 'active' });
      toast.success('Company approved');
      fetchCompanies();
    } catch (e) {
      toast.error('Failed to approve company');
    }
  };

  const handleReject = async (companyId: string) => {
    try {
      await updateDoc(doc(db, 'companies', companyId), { status: 'rejected' });
      toast.success('Company rejected');
      fetchCompanies();
    } catch (e) {
      toast.error('Failed to reject company');
    }
  };"""

new_approve = """  const handleApprove = async (companyId: string) => {
    try {
      await updateDoc(doc(db, 'companies', companyId), { status: 'active' });
      const auth = getAuth();
      if (auth.currentUser) {
        await addDoc(collection(db, 'platform/auditLog/events'), {
          action: 'APPROVE_COMPANY',
          companyId,
          performedBy: auth.currentUser.email,
          timestamp: new Date().getTime()
        });
      }
      toast.success('Company approved');
      fetchCompanies();
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve company');
    }
  };

  const handleReject = async (companyId: string) => {
    try {
      await updateDoc(doc(db, 'companies', companyId), { status: 'rejected' });
      const auth = getAuth();
      if (auth.currentUser) {
        await addDoc(collection(db, 'platform/auditLog/events'), {
          action: 'REJECT_COMPANY',
          companyId,
          performedBy: auth.currentUser.email,
          timestamp: new Date().getTime()
        });
      }
      toast.success('Company rejected');
      fetchCompanies();
    } catch (e) {
      console.error(e);
      toast.error('Failed to reject company');
    }
  };"""

content = content.replace(old_approve, new_approve)
if "import { getAuth } from 'firebase/auth';" not in content:
    content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport { getAuth } from 'firebase/auth';")

with open('src/pages/Companies.tsx', 'w') as f:
    f.write(content)

with open('src/pages/Charities.tsx', 'r') as f:
    content = f.read()

old_bulk = """    if (newStatus) {
      for (const id of selectedCharityIds) {
        if (typeof id === 'string') { // It's from Firestore
          try {
            await updateDoc(doc(db, 'charities', id), { status: newStatus });
          } catch(e) {
            console.error(e);
          }
        }
      }
    }"""

new_bulk = """    if (newStatus) {
      const auth = getAuth();
      for (const id of selectedCharityIds) {
        if (typeof id === 'string') { // It's from Firestore
          try {
            await updateDoc(doc(db, 'charities', id), { status: newStatus });
            if (auth.currentUser) {
              await addDoc(collection(db, 'platform/auditLog/events'), {
                action: action === 'approve' ? 'APPROVE_CHARITY' : 'REJECT_CHARITY',
                charityId: id,
                performedBy: auth.currentUser.email,
                timestamp: new Date().getTime()
              });
            }
          } catch(e) {
            console.error(e);
          }
        }
      }
    }"""

content = content.replace(old_bulk, new_bulk)
if "import { getAuth } from 'firebase/auth';" not in content:
    content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport { getAuth } from 'firebase/auth';")

if "import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';" in content:
    content = content.replace("import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';", "import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';")

with open('src/pages/Charities.tsx', 'w') as f:
    f.write(content)

